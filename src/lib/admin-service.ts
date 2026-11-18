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
  ServiceDetail,
  WorkDetail,
  ShowcaseItem,
  BlogPostDetail,
} from '@/types/content';
import { DEFAULT_SETTINGS, SiteSettings } from '@/types/settings';
import { driveImageUrl } from './drive-image';

export const ADMIN_EMAILS = ['premmohan0147@gmail.com'];

export interface DriveFileInfo {
  id: string;
  name: string;
  url: string;
  viewUrl?: string;
  thumbnail?: string;
}

/**
 * Triggers on-demand Next.js cache revalidation via server API route
 * Supports both data tags and specific page URL paths
 */
export async function triggerRevalidation(
  tags: string[] = [],
  paths: string[] = []
): Promise<boolean> {
  try {
    const user = auth.currentUser;
    if (!user) return false;
    const idToken = await user.getIdToken();
    const res = await fetch('/api/revalidate', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ idToken, tags, paths }),
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      console.warn('[admin-service] revalidation rejected:', res.status, body?.error);
    }
    return res.ok;
  } catch (err) {
    console.warn('[admin-service] triggerRevalidation failed:', err);
    return false;
  }
}

export interface SaveItemResponse {
  renamed: boolean;
  slug: string;
  previousSlugs: string[];
}

/**
 * Rename-safe save for a service / work / post via the server (/api/admin/items/save).
 * The server moves the document, its SEO metadata and any references when the slug changes,
 * records the old slug for 308 redirects, and revalidates the affected pages.
 * Throws an Error with a user-presentable message on failure.
 */
export async function saveItemViaApi(args: {
  kind: 'service' | 'work' | 'post';
  oldSlug: string | null;
  newSlug: string;
  payload: Record<string, any>;
}): Promise<SaveItemResponse> {
  const user = auth.currentUser;
  if (!user) throw new Error('You are signed out. Please sign in again.');
  const idToken = await user.getIdToken();
  const res = await fetch('/api/admin/items/save', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ idToken, ...args }),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body?.error || `Save failed (${res.status})`);
  return body as SaveItemResponse;
}

/**
 * Check admin status for UI gate
 */
export async function checkIsAdmin(email?: string | null): Promise<boolean> {
  if (!email) return false;
  const cleanEmail = email.toLowerCase().trim();
  return ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(cleanEmail);
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
 * Resizes and uploads image via server proxy route /api/upload
 */
export interface StoredImage {
  id: string; // Firebase Storage path, e.g. images/works/1731...-cover.webp
  name: string;
  url: string;
  thumbnail?: string;
}

async function authToken(action: string): Promise<string> {
  const currentUser = auth.currentUser;
  if (!currentUser) throw new Error(`You must be signed in as an administrator to ${action}.`);
  return currentUser.getIdToken();
}

async function callImageApi(payload: Record<string, any>) {
  const res = await fetch('/api/upload', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || `Request failed with status ${res.status}`);
  return data;
}

/** Compresses in the browser, then uploads to Firebase Storage via the admin API. */
export async function uploadImage(file: File, category: string): Promise<{ id: string; url: string }> {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type. Please upload a JPG, PNG, or WebP image.');
  }
  const idToken = await authToken('upload images');
  const { base64, mimeType } = await resizeAndCompressImage(file, 2000, 0.85);
  const data = await callImageApi({ action: 'upload', idToken, category, filename: file.name, mimeType, base64 });
  return { id: data.id, url: data.url };
}

/** Lists images stored in Firebase Storage for a category folder. */
export async function listDriveImages(category: string): Promise<StoredImage[]> {
  const idToken = await authToken('view the image library');
  const data = await callImageApi({ action: 'list', idToken, category });
  return (data.files || []).map((f: any) => ({ id: f.id, name: f.name, url: f.url, thumbnail: f.url }));
}

/** Permanently deletes an image file from Firebase Storage. */
export async function deleteImage(path: string): Promise<void> {
  const idToken = await authToken('delete images');
  await callImageApi({ action: 'delete', idToken, path });
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
