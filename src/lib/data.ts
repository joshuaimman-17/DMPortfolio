import 'server-only';
import { unstable_cache } from 'next/cache';
import { getAdminFirestore } from './firebase-admin';
import {
  PORTFOLIO_DATA,
  ServiceDetail,
  WorkDetail,
  ShowcaseItem,
  BlogPostDetail,
} from '@/data/portfolioData';
import { SiteSettings, DEFAULT_SETTINGS } from '@/types/settings';
export { type SiteSettings, DEFAULT_SETTINGS };

/**
 * Recursively converts Firestore Timestamp instances or objects with toDate()
 * into ISO string representations so all data is strictly serializable across RSC.
 */
function serializeFirestoreData(obj: any): any {
  if (obj === null || obj === undefined) return obj;
  if (typeof obj === 'object') {
    if (typeof obj.toDate === 'function') {
      return obj.toDate().toISOString();
    }
    if (Array.isArray(obj)) {
      return obj.map(serializeFirestoreData);
    }
    const result: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      result[key] = serializeFirestoreData(obj[key]);
    }
    return result;
  }
  return obj;
}

/**
 * Internal server query for published items in Firestore with fallback
 */
async function fetchPublishedCollectionServer<T>(
  collectionName: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const firestore = getAdminFirestore();
    const snapshot = await firestore
      .collection(collectionName)
      .where('status', '==', 'published')
      .orderBy('order', 'asc')
      .get();

    if (snapshot.empty) {
      return fallbackData;
    }

    const items: T[] = [];
    snapshot.forEach((doc) => {
      const data = serializeFirestoreData(doc.data());
      items.push({ id: doc.id, ...data } as T);
    });
    return items;
  } catch (error) {
    console.warn(`[data.ts] Failed to fetch collection ${collectionName} via firebase-admin:`, error);
    return fallbackData;
  }
}

/**
 * Internal server query for site settings
 */
async function fetchSiteSettingsServer(): Promise<SiteSettings> {
  try {
    const firestore = getAdminFirestore();
    const [heroDoc, metricsDoc, contactDoc, socialDoc, footerDoc, integrationsDoc] =
      await Promise.all([
        firestore.collection('settings').doc('hero').get(),
        firestore.collection('settings').doc('metrics').get(),
        firestore.collection('settings').doc('contact').get(),
        firestore.collection('settings').doc('social').get(),
        firestore.collection('settings').doc('footer').get(),
        firestore.collection('settings').doc('integrations').get(),
      ]);

    return {
      hero: heroDoc.exists ? (heroDoc.data()?.data || DEFAULT_SETTINGS.hero) : DEFAULT_SETTINGS.hero,
      metrics: metricsDoc.exists ? (metricsDoc.data()?.data || DEFAULT_SETTINGS.metrics) : DEFAULT_SETTINGS.metrics,
      contact: contactDoc.exists ? (contactDoc.data()?.data || DEFAULT_SETTINGS.contact) : DEFAULT_SETTINGS.contact,
      social: socialDoc.exists ? (socialDoc.data()?.data || DEFAULT_SETTINGS.social) : DEFAULT_SETTINGS.social,
      footer: footerDoc.exists ? (footerDoc.data()?.data || DEFAULT_SETTINGS.footer) : DEFAULT_SETTINGS.footer,
      integrations: integrationsDoc.exists ? (integrationsDoc.data()?.data || DEFAULT_SETTINGS.integrations) : DEFAULT_SETTINGS.integrations,
    };
  } catch (error) {
    console.warn('[data.ts] Failed to fetch settings via firebase-admin:', error);
    return DEFAULT_SETTINGS;
  }
}

// Cached accessors with discrete tags and 5-minute background revalidation
export const getServices = unstable_cache(
  async () => fetchPublishedCollectionServer<ServiceDetail>('services', PORTFOLIO_DATA.services),
  ['services-list'],
  { tags: ['services'], revalidate: 300 }
);

export const getWorks = unstable_cache(
  async () => fetchPublishedCollectionServer<WorkDetail>('works', PORTFOLIO_DATA.works),
  ['works-list'],
  { tags: ['works'], revalidate: 300 }
);

export const getShowcase = unstable_cache(
  async () => fetchPublishedCollectionServer<ShowcaseItem>('showcase', PORTFOLIO_DATA.showcase),
  ['showcase-list'],
  { tags: ['showcase'], revalidate: 300 }
);

export const getPosts = unstable_cache(
  async () => fetchPublishedCollectionServer<BlogPostDetail>('posts', PORTFOLIO_DATA.blogPosts),
  ['posts-list'],
  { tags: ['posts'], revalidate: 300 }
);

export const getTestimonials = unstable_cache(
  async () => fetchPublishedCollectionServer<any>('testimonials', PORTFOLIO_DATA.testimonials),
  ['testimonials-list'],
  { tags: ['testimonials'], revalidate: 300 }
);

export const getSiteSettings = unstable_cache(
  async () => fetchSiteSettingsServer(),
  ['site-settings'],
  { tags: ['settings'], revalidate: 300 }
);

// Helpers for specific detail items
export async function getServiceBySlug(slug: string): Promise<ServiceDetail | undefined> {
  const all = await getServices();
  return all.find((s) => s.slug === slug);
}

export async function getWorkBySlug(slug: string): Promise<WorkDetail | undefined> {
  const all = await getWorks();
  return all.find((w) => w.slug === slug);
}

export async function getPostBySlug(slug: string): Promise<BlogPostDetail | undefined> {
  const all = await getPosts();
  return all.find((p) => p.slug === slug);
}
