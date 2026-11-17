import 'server-only';
import { unstable_cache } from 'next/cache';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  initializeFirestore,
  setLogLevel,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from './firebase-config';
import {
  ServiceDetail,
  WorkDetail,
  ShowcaseItem,
  BlogPostDetail,
} from '@/types/content';
import { SiteSettings, DEFAULT_SETTINGS, PageMetadata } from '@/types/settings';
import { mergeHome } from '@/types/home-content';
import { getSiteUrl } from '@/lib/site-url';
export { type SiteSettings, DEFAULT_SETTINGS, type PageMetadata };

// Suppress benign gRPC idle stream disconnection notices on the server
try {
  setLogLevel('silent');
} catch {
  // Ignore
}

let cachedServerFirestore: Firestore | null = null;

function getServerFirestore(): Firestore {
  if (cachedServerFirestore) {
    return cachedServerFirestore;
  }

  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  const config = firebaseConfig as any;
  const customDbId =
    config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
      ? config.firestoreDatabaseId
      : undefined;

  try {
    cachedServerFirestore = customDbId
      ? initializeFirestore(
          app,
          {
            experimentalAutoDetectLongPolling: true,
            ignoreUndefinedProperties: true,
          },
          customDbId
        )
      : initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true,
          ignoreUndefinedProperties: true,
        });
  } catch {
    cachedServerFirestore = customDbId
      ? getFirestore(app, customDbId)
      : getFirestore(app);
  }

  return cachedServerFirestore;
}

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
function extractSetting<T extends Record<string, any>>(docSnap: any, defaultVal: T): T {
  if (!docSnap || !docSnap.exists()) return defaultVal;
  const d = docSnap.data();
  const payload = d?.data && typeof d.data === 'object' ? d.data : d;
  return { ...defaultVal, ...payload };
}

/**
 * Internal server query for published items in Firestore with fallback
 */
async function fetchPublishedCollectionServer<T>(
  collectionName: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const firestore = getServerFirestore();
    const q = query(collection(firestore, collectionName), where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return [];
    }

    const items: T[] = [];
    snapshot.forEach((d) => {
      const data = serializeFirestoreData(d.data());
      items.push({ id: d.id, ...data } as T);
    });

    items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));

    // Firebase is the single source of truth: no static merge (it would leak static images).
    return items;
  } catch (error) {
    return [];
  }
}

/**
 * Internal server query for site settings
 */
async function fetchSiteSettingsServer(): Promise<SiteSettings> {
  try {
    const firestore = getServerFirestore();
    const [heroDoc, metricsDoc, contactDoc, socialDoc, footerDoc, integrationsDoc, profileDoc, homeDoc] =
      await Promise.all([
        getDoc(doc(firestore, 'settings', 'hero')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'metrics')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'contact')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'social')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'footer')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'integrations')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'profile')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'home')).catch(() => null),
      ]);

    const profileData = profileDoc?.exists() ? profileDoc.data() : null;
    const heroData = heroDoc?.exists() ? (heroDoc.data()?.data || heroDoc.data()) : null;
    const name = profileData?.name || heroData?.name || DEFAULT_SETTINGS.name || 'Alex Rivera';

    return {
      name,
      hero: extractSetting(heroDoc, DEFAULT_SETTINGS.hero),
      metrics: extractSetting(metricsDoc, DEFAULT_SETTINGS.metrics),
      contact: extractSetting(contactDoc, DEFAULT_SETTINGS.contact),
      social: extractSetting(socialDoc, DEFAULT_SETTINGS.social),
      footer: extractSetting(footerDoc, DEFAULT_SETTINGS.footer),
      home: mergeHome(extractSetting<any>(homeDoc, {})),
      integrations: extractSetting(integrationsDoc, DEFAULT_SETTINGS.integrations || { googleSheetUrl: '', driveFolderUrl: '' }),
    };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

// Cached accessors with discrete tags and on-demand revalidation only
export const getServices = unstable_cache(
  async () => fetchPublishedCollectionServer<ServiceDetail>('services', []),
  ['services-list'],
  { tags: ['services'], revalidate: false }
);

export const getWorks = unstable_cache(
  async () => fetchPublishedCollectionServer<WorkDetail>('works', []),
  ['works-list'],
  { tags: ['works'], revalidate: false }
);

export const getShowcase = unstable_cache(
  async () => fetchPublishedCollectionServer<ShowcaseItem>('showcase', []),
  ['showcase-list'],
  { tags: ['showcase'], revalidate: false }
);

export const getPosts = unstable_cache(
  async () => fetchPublishedCollectionServer<BlogPostDetail>('posts', []),
  ['posts-list'],
  { tags: ['posts'], revalidate: false }
);

export const getTestimonials = unstable_cache(
  async () => fetchPublishedCollectionServer<any>('testimonials', []),
  ['testimonials-list'],
  { tags: ['testimonials'], revalidate: false }
);

export const getSiteSettings = unstable_cache(
  async () => fetchSiteSettingsServer(),
  ['site-settings'],
  { tags: ['settings'], revalidate: false }
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

/**
 * Resolves full PageMetadata conforming to the user's explicit schema.
 * Checks Firestore collection 'pages_metadata' for custom overrides,
 * falling back gracefully to route-specific defaults and dynamic site settings.
 */
export async function getPageMetadata(
  routeId: string,
  fallback: {
    title: string;
    description: string;
    path: string;
    image?: string;
  }
): Promise<PageMetadata> {
  const settings = await getSiteSettings();
  const siteName = settings.name || 'Alex Rivera';
  const siteUrl = getSiteUrl();
  const cleanPath = fallback.path.startsWith('/') ? fallback.path : `/${fallback.path}`;
  const fullUrl = `${siteUrl.replace(/\/$/, '')}${cleanPath}`;
  const defaultImage = fallback.image || settings.hero.avatar || settings.hero.image || '';

  const defaultMeta: PageMetadata = {
    title: `${fallback.title} | ${siteName}`,
    description: fallback.description,
    alternates: {
      canonical: cleanPath,
    },
    openGraph: {
      title: `${fallback.title} | ${siteName}`,
      description: fallback.description,
      url: fullUrl,
      siteName: siteName,
      locale: 'en_US',
      type: 'website',
      images: defaultImage
        ? [{ url: defaultImage, width: 1200, height: 630, alt: fallback.title }]
        : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fallback.title} | ${siteName}`,
      description: fallback.description,
      images: defaultImage ? [defaultImage] : [],
    },
  };

  try {
    const firestore = getServerFirestore();
    const docSnap = await getDoc(doc(firestore, 'pages_metadata', routeId));
    if (!docSnap.exists()) {
      return defaultMeta;
    }
    const data = docSnap.data();
    if (!data) return defaultMeta;

    return {
      title: data.title ? (data.title.includes(siteName) ? data.title : `${data.title} | ${siteName}`) : defaultMeta.title,
      description: data.description || defaultMeta.description,
      alternates: {
        canonical: data.alternates?.canonical || defaultMeta.alternates.canonical,
      },
      openGraph: {
        title: data.openGraph?.title || data.title || defaultMeta.openGraph.title,
        description: data.openGraph?.description || data.description || defaultMeta.openGraph.description,
        url: data.openGraph?.url || defaultMeta.openGraph.url,
        siteName: siteName,
        locale: 'en_US',
        type: 'website',
        images: Array.isArray(data.openGraph?.images) && data.openGraph.images.length > 0
          ? data.openGraph.images.map((img: any) => ({
              url: img.url || defaultImage,
              width: Number(img.width) || 1200,
              height: Number(img.height) || 630,
              alt: img.alt || fallback.title,
            }))
          : defaultMeta.openGraph.images,
      },
      twitter: {
        card: 'summary_large_image',
        title: data.twitter?.title || data.title || defaultMeta.twitter.title,
        description: data.twitter?.description || data.description || defaultMeta.twitter.description,
        images: Array.isArray(data.twitter?.images) && data.twitter.images.length > 0
          ? data.twitter.images
          : defaultMeta.twitter.images,
      },
    };
  } catch {
    return defaultMeta;
  }
}

