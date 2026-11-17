import { mergeHome, type HomeContent } from '../types/home-content';
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
  serverTimestamp,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { submitForm } from './backend';
import {
  ServiceDetail,
  WorkDetail,
  ShowcaseItem,
  BlogPostDetail,
} from '@/types/content';

export const ADMIN_EMAILS = [
  'joshuaimman8@gmail.com',
  'joshuaimman2004@gmail.com',
  'alex@growthmark.io',
  'jashper078@gmail.com',
  'YOUR_EMAIL@gmail.com',
];

export interface SiteSettings {
  name?: string;
  home?: HomeContent;
  hero: {
    roleTag: string;
    headline: string;
    subtext: string;
    badge1: string;
    badge2: string;
    badge3: string;
    avatar?: string;
    image?: string;
    driveFileId?: string;
  };
  metrics: {
    metric1: { value: string; label: string; desc: string };
    metric2: { value: string; label: string; desc: string };
    metric3: { value: string; label: string; desc: string };
    metric4: { value: string; label: string; desc: string };
  };
  contact: {
    email: string;
    phone: string;
    location: string;
    whatsapp: string;
  };
  social: {
    linkedin: string;
    twitter: string;
    github: string;
  };
  footer: {
    tagline: string;
    copyright: string;
  };
  integrations?: {
    googleSheetUrl: string;
    driveFolderUrl: string;
  };
}

export const DEFAULT_SETTINGS: SiteSettings = {
  name: '',
  hero: {
    roleTag: '',
    headline: 'I help brands grow with SEO and performance marketing',
    subtext: '',
    badge1: '+120% Organic Traffic Growth',
    badge2: '4.5x Average ROAS Blended Acquisition',
    badge3: 'Meta & Google Partner',
  },
  metrics: {
    metric1: { value: '+120%', label: 'Organic Traffic', desc: 'Avg. 6-Month Organic Uplift Across Audited Clients' },
    metric2: { value: '4.5x', label: 'Blended ROAS', desc: 'Average Return on Ad Spend Across Meta & Google' },
    metric3: { value: '₹50L+', label: 'Ad Spend Managed', desc: 'Over Google & Meta Ads Campaigns with Zero Wastage' },
    metric4: { value: '30+', label: 'Completed Engagements', desc: 'Enterprise & D2C Brands with Documented Growth Trajectories' },
  },
  contact: {
    email: '',
    phone: '',
    location: '',
    whatsapp: '+1 (555) 234-8900',
  },
  social: {
    linkedin: '',
    twitter: '',
    github: '',
  },
  footer: {
    tagline: 'Helping high-growth B2B SaaS and D2C brands scale with quantitative SEO, performance marketing, and server-side tracking integrity.',
    copyright: '© 2026 Alex Rivera. All rights reserved.',
  },
  integrations: {
    googleSheetUrl: 'https://docs.google.com/spreadsheets',
    driveFolderUrl: 'https://drive.google.com/drive',
  },
};

export interface SubmissionItem {
  id: string;
  type: 'audit' | 'contact';
  name: string;
  email: string;
  company?: string;
  website?: string;
  message?: string;
  challenge?: string;
  budget?: string;
  preferredSlot?: string;
  service?: string;
  companyUrl?: string;
  slot?: string;
  currentMetrics?: string;
  sourcePage?: string;
  status: 'New' | 'Contacted' | 'Closed';
  notified?: boolean;
  sheetsSaved?: boolean;
  adminNotified?: boolean;
  userConfirmed?: boolean;
  createdAt: any;
}

export interface SubscriberItem {
  id: string;
  email: string;
  notified?: boolean;
  sheetsSaved?: boolean;
  adminNotified?: boolean;
  userConfirmed?: boolean;
  createdAt: any;
}

// Check admin status in Firestore
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

// Automatically ensure admin record exists in Firestore upon login
export async function ensureAdminRecord(email?: string | null): Promise<void> {
  if (!email) return;
  const cleanEmail = email.toLowerCase().trim();
  if (ADMIN_EMAILS.map((e) => e.toLowerCase()).includes(cleanEmail)) {
    try {
      const adminRef = doc(db, 'admins', cleanEmail);
      await setDoc(adminRef, {
        email: cleanEmail,
        role: 'admin',
        lastLoginAt: new Date().toISOString(),
      }, { merge: true });
    } catch (err) {
      console.warn('Auto-sync admin record error:', err);
    }
  }
}

export async function fetchPublishedCollection<T>(collectionName: string, fallbackData: T[]): Promise<T[]> {
  try {
    const q = query(collection(db, collectionName), where('status', '==', 'published'), orderBy('order', 'asc'));
    const snapshot = await getDocs(q);
    if (snapshot.empty) {
      return fallbackData;
    }
    const items: T[] = [];
    snapshot.forEach((d) => {
      items.push({ id: d.id, ...d.data() } as T);
    });
    return items;
  } catch (err) {
    // If permission or network issue, fallback safely to sample data
    return fallbackData;
  }
}

// Fetch all settings with fallback
export async function fetchSiteSettings(): Promise<SiteSettings> {
  try {
    const [heroDoc, metricsDoc, contactDoc, socialDoc, footerDoc, integrationsDoc, profileDoc, homeDoc] = await Promise.all([
      getDoc(doc(db, 'settings', 'hero')),
      getDoc(doc(db, 'settings', 'metrics')),
      getDoc(doc(db, 'settings', 'contact')),
      getDoc(doc(db, 'settings', 'social')),
      getDoc(doc(db, 'settings', 'footer')),
      getDoc(doc(db, 'settings', 'integrations')),
      getDoc(doc(db, 'settings', 'profile')),
      getDoc(doc(db, 'settings', 'home')),
    ]);

    return {
      name: profileDoc.exists() ? (profileDoc.data().name || DEFAULT_SETTINGS.name) : DEFAULT_SETTINGS.name,
      hero: heroDoc.exists() ? (heroDoc.data().data || DEFAULT_SETTINGS.hero) : DEFAULT_SETTINGS.hero,
      metrics: metricsDoc.exists() ? (metricsDoc.data().data || DEFAULT_SETTINGS.metrics) : DEFAULT_SETTINGS.metrics,
      contact: contactDoc.exists() ? (contactDoc.data().data || DEFAULT_SETTINGS.contact) : DEFAULT_SETTINGS.contact,
      social: socialDoc.exists() ? (socialDoc.data().data || DEFAULT_SETTINGS.social) : DEFAULT_SETTINGS.social,
      footer: footerDoc.exists() ? (footerDoc.data().data || DEFAULT_SETTINGS.footer) : DEFAULT_SETTINGS.footer,
      home: mergeHome(homeDoc.exists() ? (homeDoc.data().data || {}) : {}),
      integrations: integrationsDoc.exists() ? (integrationsDoc.data().data || DEFAULT_SETTINGS.integrations) : DEFAULT_SETTINGS.integrations,
    };
  } catch {
    return DEFAULT_SETTINGS;
  }
}

// Submit inbound audit / contact with honeypot validation, Firestore persistence, and Sheets/Gmail sync
export async function submitInboundForm(data: {
  type: 'audit' | 'contact';
  name: string;
  email: string;
  company?: string;
  website?: string;
  message?: string;
  challenge?: string;
  budget?: string;
  preferredSlot?: string;
  service?: string;
  currentMetrics?: string;
  sourcePage?: string;
  honeypot?: string; // Bot protection
}): Promise<{ success: boolean; notified?: boolean; error?: string }> {
  // Silent reject for bots
  if (data.honeypot && data.honeypot.trim().length > 0) {
    return { success: true, notified: false };
  }

  // Basic validation
  if (!data.name || data.name.trim().length === 0 || data.name.length > 100) {
    return { success: false, error: 'Please provide a valid name (1-100 characters).' };
  }
  if (!data.email || !data.email.includes('@') || data.email.length > 150) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  // 1. Send to Google Apps Script (Google Sheets + Gmail)
  let scriptSuccess = false;
  try {
    const scriptRes = await submitForm(
      data.type,
      {
        name: data.name.trim(),
        email: data.email.trim().toLowerCase(),
        companyUrl: data.website?.trim() || data.company?.trim() || '',
        challenge: data.challenge?.trim() || '',
        budget: data.budget?.trim() || '',
        slot: data.preferredSlot?.trim() || '',
        service: data.service?.trim() || '',
        message: data.message?.trim() || '',
      },
      data.honeypot
    );
    scriptSuccess = scriptRes.success;
  } catch {
    scriptSuccess = false;
  }

  // 2. Save to Firestore as source of truth
  let firestoreSuccess = false;
  const submissionDoc = {
    type: data.type,
    name: data.name.trim(),
    email: data.email.trim().toLowerCase(),
    company: data.company?.trim().slice(0, 200) || '',
    website: data.website?.trim().slice(0, 200) || '',
    companyUrl: data.website?.trim().slice(0, 200) || data.company?.trim().slice(0, 200) || '',
    message: data.message?.trim().slice(0, 2000) || '',
    challenge: data.challenge?.trim().slice(0, 1000) || '',
    budget: data.budget?.trim().slice(0, 100) || '',
    preferredSlot: data.preferredSlot?.trim().slice(0, 100) || '',
    service: data.service?.trim().slice(0, 100) || '',
    currentMetrics: data.currentMetrics?.trim().slice(0, 500) || '',
    sourcePage: data.sourcePage || window.location.hash || '/',
    status: 'New',
    notified: scriptSuccess,
    createdAt: new Date().toISOString(),
  };

  try {
    const newDocRef = doc(collection(db, 'submissions'));
    await setDoc(newDocRef, submissionDoc);
    firestoreSuccess = true;
  } catch {
    firestoreSuccess = false;
  }

  // If either succeeded, report success to the visitor
  if (firestoreSuccess || scriptSuccess) {
    return { success: true, notified: scriptSuccess };
  }

  return { success: false, error: 'Failed to record submission. Please try again or reach out directly.' };
}

// Newsletter subscription with email deduplication, Firestore persistence, and Sheets/Gmail sync
export async function subscribeNewsletter(email: string, honeypot = ''): Promise<{ success: boolean; notified?: boolean; error?: string }> {
  if (honeypot && honeypot.trim().length > 0) {
    return { success: true, notified: false };
  }

  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length > 150) {
    return { success: false, error: 'Please provide a valid email address.' };
  }

  // 1. Sync with Google Sheets & Gmail
  let scriptSuccess = false;
  try {
    const scriptRes = await submitForm(
      'newsletter',
      {
        email: cleanEmail,
        name: cleanEmail.split('@')[0],
      },
      honeypot
    );
    scriptSuccess = scriptRes.success;
  } catch {
    scriptSuccess = false;
  }

  // 2. Save to Firestore
  let firestoreSuccess = false;
  try {
    const subscriberRef = doc(db, 'subscribers', cleanEmail.replace(/[^a-zA-Z0-9@._-]/g, '_'));
    await setDoc(subscriberRef, {
      email: cleanEmail,
      notified: scriptSuccess,
      createdAt: new Date().toISOString(),
    }, { merge: true });
    firestoreSuccess = true;
  } catch {
    firestoreSuccess = false;
  }

  if (firestoreSuccess || scriptSuccess) {
    return { success: true, notified: scriptSuccess };
  }

  return { success: false, error: 'Failed to subscribe. Please try again.' };
}

// Upload file to Firebase Storage if available, returns download URL
/**
 * Uploads an image to Firebase Storage through the admin-only server route (/api/upload).
 * (Direct browser uploads need Storage security rules; the server route uses the service account.)
 */
export async function uploadMediaFile(file: File, folder = 'uploads'): Promise<string> {
  const { uploadImage } = await import('./admin-service');
  const res = await uploadImage(file, folder);
  return res.url;
}
