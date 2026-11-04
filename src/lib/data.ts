import 'server-only';
import { unstable_cache } from 'next/cache';
import { initializeApp, getApps, getApp } from 'firebase/app';
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where,
  type Firestore,
} from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';
import {
  PORTFOLIO_DATA,
  ServiceDetail,
  WorkDetail,
  ShowcaseItem,
  BlogPostDetail,
} from '@/data/portfolioData';
import { SiteSettings, DEFAULT_SETTINGS, PageMetadata } from '@/types/settings';
export { type SiteSettings, DEFAULT_SETTINGS, type PageMetadata };

function getServerFirestore(): Firestore {
  const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
  return firebaseConfig.firestoreDatabaseId && firebaseConfig.firestoreDatabaseId !== '(default)'
    ? getFirestore(app, firebaseConfig.firestoreDatabaseId)
    : getFirestore(app);
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
async function fetchPublishedCollectionServer<T>(
  collectionName: string,
  fallbackData: T[]
): Promise<T[]> {
  try {
    const firestore = getServerFirestore();
    const q = query(collection(firestore, collectionName), where('status', '==', 'published'));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return fallbackData;
    }

    const items: T[] = [];
    snapshot.forEach((d) => {
      const data = serializeFirestoreData(d.data());
      items.push({ id: d.id, ...data } as T);
    });

    items.sort((a: any, b: any) => (a.order || 0) - (b.order || 0));
    return items;
  } catch (error) {
    return fallbackData;
  }
}

/**
 * Internal server query for site settings
 */
async function fetchSiteSettingsServer(): Promise<SiteSettings> {
  try {
    const firestore = getServerFirestore();
    const [heroDoc, metricsDoc, contactDoc, socialDoc, footerDoc, integrationsDoc, profileDoc] =
      await Promise.all([
        getDoc(doc(firestore, 'settings', 'hero')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'metrics')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'contact')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'social')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'footer')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'integrations')).catch(() => null),
        getDoc(doc(firestore, 'settings', 'profile')).catch(() => null),
      ]);

    const profileData = profileDoc?.exists() ? profileDoc.data() : null;
    const heroData = heroDoc?.exists() ? heroDoc.data()?.data : null;
    const name = profileData?.name || heroData?.name || DEFAULT_SETTINGS.name || 'Alex Rivera';

    return {
      name,
      hero: heroDoc?.exists() ? (heroDoc.data()?.data || DEFAULT_SETTINGS.hero) : DEFAULT_SETTINGS.hero,
      metrics: metricsDoc?.exists() ? (metricsDoc.data()?.data || DEFAULT_SETTINGS.metrics) : DEFAULT_SETTINGS.metrics,
      contact: contactDoc?.exists() ? (contactDoc.data()?.data || DEFAULT_SETTINGS.contact) : DEFAULT_SETTINGS.contact,
      social: socialDoc?.exists() ? (socialDoc.data()?.data || DEFAULT_SETTINGS.social) : DEFAULT_SETTINGS.social,
      footer: footerDoc?.exists() ? (footerDoc.data()?.data || DEFAULT_SETTINGS.footer) : DEFAULT_SETTINGS.footer,
      integrations: integrationsDoc?.exists() ? (integrationsDoc.data()?.data || DEFAULT_SETTINGS.integrations) : DEFAULT_SETTINGS.integrations,
    };
  } catch (error) {
    return DEFAULT_SETTINGS;
  }
}

// Cached accessors with discrete tags and on-demand revalidation only
export const getServices = unstable_cache(
  async () => fetchPublishedCollectionServer<ServiceDetail>('services', PORTFOLIO_DATA.services),
  ['services-list'],
  { tags: ['services'], revalidate: false }
);

export const getWorks = unstable_cache(
  async () => fetchPublishedCollectionServer<WorkDetail>('works', PORTFOLIO_DATA.works),
  ['works-list'],
  { tags: ['works'], revalidate: false }
);

export const getShowcase = unstable_cache(
  async () => fetchPublishedCollectionServer<ShowcaseItem>('showcase', PORTFOLIO_DATA.showcase),
  ['showcase-list'],
  { tags: ['showcase'], revalidate: false }
);

export const getPosts = unstable_cache(
  async () => fetchPublishedCollectionServer<BlogPostDetail>('posts', PORTFOLIO_DATA.blogPosts),
  ['posts-list'],
  { tags: ['posts'], revalidate: false }
);

export const getTestimonials = unstable_cache(
  async () => fetchPublishedCollectionServer<any>('testimonials', PORTFOLIO_DATA.testimonials),
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
  const siteUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://alexriveragrowth.com';
  const cleanPath = fallback.path.startsWith('/') ? fallback.path : `/${fallback.path}`;
  const fullUrl = `${siteUrl.replace(/\/$/, '')}${cleanPath}`;
  const defaultImage = fallback.image || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=1200&h=630&fit=crop';

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
      images: [
        {
          url: defaultImage,
          width: 1200,
          height: 630,
          alt: fallback.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: `${fallback.title} | ${siteName}`,
      description: fallback.description,
      images: [defaultImage],
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

