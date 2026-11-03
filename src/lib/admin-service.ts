'use client';

import {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  writeBatch,
} from 'firebase/firestore';
import { db, auth } from './firebase-client';
import {
  PORTFOLIO_DATA,
  ServiceDetail,
  WorkDetail,
  ShowcaseItem,
  BlogPostDetail,
} from '@/data/portfolioData';
import { DEFAULT_SETTINGS, SiteSettings } from '@/types/settings';
import { driveImageUrl } from './drive-image';

export const ADMIN_EMAILS = [
  'joshuaimman8@gmail.com',
  'joshuaimman2004@gmail.com',
  'alex@growthmark.io',
  'YOUR_EMAIL@gmail.com',
];

export interface DriveFileInfo {
  id: string;
  name: string;
  url: string;
  viewUrl?: string;
  thumbnail?: string;
}

/**
 * Triggers on-demand Next.js cache revalidation via server API route
 */
export async function triggerRevalidation(tags: string[]): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    const idToken = await user.getIdToken();
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, tags }),
    });
    return res.ok;
  } catch (err) {
    console.warn('[admin-service] triggerRevalidation failed:', err);
    return false;
  }
}

/**
 * Check admin status for UI gate
 */
export async function checkIsAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  if (ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(cleanEmail)) {
    return true;
  }
  try {
    const adminDoc = await getDoc(doc(db, 'admins', cleanEmail));
    return adminDoc.exists();
  } catch {
    return false;
  }
}

/**
 * Ensure admin record exists in Firestore upon login
 */
export async function ensureAdminRecord(email?: string | null): Promise<void> {
  if (!email) return;
  const cleanEmail = email.toLowerCase().trim();
  if (ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(cleanEmail)) {
    try {
      const adminRef = doc(db, 'admins', cleanEmail);
      await setDoc(
        adminRef,
        {
          email: cleanEmail,
          role: 'admin',
          lastLoginAt: new Date().toISOString(),
        },
        { merge: true }
      );
    } catch (err) {
      console.warn('Auto-sync admin record error:', err);
    }
  }
}

/**
 * Seed database from local sample data and trigger cache revalidation
 */
export async function seedDatabaseFromSampleData(
  adminUserEmail?: string
): Promise<{ success: boolean; message: string }> {
  try {
    const batch = writeBatch(db);

    // 1. Seed Admins
    const emailsToSeed = [...ADMIN_EMAILS];
    if (adminUserEmail && !emailsToSeed.includes(adminUserEmail)) {
      emailsToSeed.push(adminUserEmail);
    }
    for (const em of emailsToSeed) {
      const adminRef = doc(db, 'admins', em.toLowerCase());
      batch.set(adminRef, {
        email: em.toLowerCase(),
        role: 'admin',
        addedAt: new Date().toISOString(),
      });
    }

    // 2. Seed Settings
    const settingsDocs: Record<string, any> = {
      hero: DEFAULT_SETTINGS.hero,
      metrics: DEFAULT_SETTINGS.metrics,
      contact: DEFAULT_SETTINGS.contact,
      social: DEFAULT_SETTINGS.social,
      footer: DEFAULT_SETTINGS.footer,
      integrations: DEFAULT_SETTINGS.integrations,
    };
    for (const [key, data] of Object.entries(settingsDocs)) {
      const sRef = doc(db, 'settings', key);
      batch.set(sRef, { data, updatedAt: new Date().toISOString() });
    }

    // 3. Seed Services
    PORTFOLIO_DATA.services.forEach((srv, index) => {
      const sRef = doc(db, 'services', srv.slug);
      batch.set(sRef, {
        ...srv,
        status: 'published',
        order: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // 4. Seed Works
    PORTFOLIO_DATA.works.forEach((wrk, index) => {
      const wRef = doc(db, 'works', wrk.slug);
      batch.set(wRef, {
        ...wrk,
        status: 'published',
        order: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // 5. Seed Showcase
    PORTFOLIO_DATA.showcase.forEach((sc, index) => {
      const scRef = doc(db, 'showcase', sc.id);
      batch.set(scRef, {
        ...sc,
        status: 'published',
        order: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // 6. Seed Blog Posts
    PORTFOLIO_DATA.blogPosts.forEach((post, index) => {
      const pRef = doc(db, 'posts', post.slug);
      batch.set(pRef, {
        ...post,
        status: 'published',
        order: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    // 7. Seed Testimonials
    PORTFOLIO_DATA.testimonials.forEach((t, index) => {
      const tId = `testimonial-${index + 1}`;
      const tRef = doc(db, 'testimonials', tId);
      batch.set(tRef, {
        ...t,
        id: tId,
        status: 'published',
        order: index + 1,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      });
    });

    await batch.commit();

    // Revalidate all tags
    await triggerRevalidation([
      'services',
      'works',
      'showcase',
      'posts',
      'testimonials',
      'settings',
    ]);

    return {
      success: true,
      message:
        'Database successfully seeded and cache revalidated across all collections!',
    };
  } catch (error: any) {
    return { success: false, message: error?.message || 'Failed to seed database' };
  }
}

/**
 * Resizes and uploads image via server proxy route /api/upload
 */
export async function uploadImage(
  file: File,
  category: string
): Promise<{ id: string; url: string; viewUrl?: string }> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
  }

  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in as an administrator to upload images.');
  }

  const idToken = await currentUser.getIdToken();
  const { base64, mimeType } = await resizeAndCompressImage(file, 2000, 0.85);

  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'upload',
      idToken,
      category,
      filename: file.name,
      mimeType,
      base64,
    }),
  });

  if (!res.ok) {
    const errorData = await res.json().catch(() => ({}));
    throw new Error(errorData.error || `Upload failed with status ${res.status}`);
  }

  const response = await res.json();
  const driveId = response.id || response.fileId || '';
  const url = response.url || (driveId ? driveImageUrl(driveId, 1600) : '');
  const viewUrl = response.viewUrl || (driveId ? `https://drive.google.com/file/d/${driveId}/view` : url);

  return { id: driveId, url, viewUrl };
}

/**
 * Lists Drive images via server proxy route /api/upload
 */
export async function listDriveImages(category: string): Promise<any[]> {
  const currentUser = auth.currentUser;
  if (!currentUser) {
    throw new Error('You must be signed in to view Google Drive files.');
  }

  const idToken = await currentUser.getIdToken();
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      action: 'listFiles',
      idToken,
      category,
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || `Failed to list files (${res.status})`);
  }

  const response = await res.json();
  const files = response.files || response.data || [];
  return files.map((f: any) => ({
    id: f.id,
    name: f.name || 'Untitled Image',
    url: f.url || driveImageUrl(f.id, 1600),
    viewUrl: f.viewUrl || `https://drive.google.com/file/d/${f.id}/view`,
    thumbnail: driveImageUrl(f.id, 600),
  }));
}

function resizeAndCompressImage(
  file: File,
  maxWidth: number,
  quality: number
): Promise<{ base64: string; mimeType: string }> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.onload = () => {
      const img = new Image();
      img.onerror = () => reject(new Error('Failed to decode image'));
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxWidth) {
          height = Math.round((height * maxWidth) / width);
          width = maxWidth;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        if (!ctx) {
          reject(new Error('Canvas 2D context unavailable'));
          return;
        }

        ctx.drawImage(img, 0, 0, width, height);

        const targetMime = file.type === 'image/png' ? 'image/webp' : file.type || 'image/jpeg';
        let dataUrl = '';
        try {
          dataUrl = canvas.toDataURL(targetMime, quality);
          if (!dataUrl.startsWith('data:image/webp') && targetMime === 'image/webp') {
            dataUrl = canvas.toDataURL('image/jpeg', quality);
          }
        } catch {
          dataUrl = canvas.toDataURL('image/jpeg', quality);
        }

        const parts = dataUrl.split(',');
        const mimeMatch = parts[0].match(/:(.*?);/);
        const mimeType = mimeMatch ? mimeMatch[1] : 'image/jpeg';
        const base64 = parts[1] || '';

        resolve({ base64, mimeType });
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  });
}
