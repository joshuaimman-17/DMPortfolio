import type { SiteSettings } from '@/types/settings';
import { getSiteUrl } from '@/lib/site-url';

/** All structured data is built from Firestore content (settings, services, posts) — nothing hard-coded. */

export { getSiteUrl };

/** Drops empty strings / empty arrays / undefined so the JSON-LD stays valid and minimal. */
function clean<T extends Record<string, any>>(obj: T): T {
  const out: Record<string, any> = {};
  for (const [k, v] of Object.entries(obj)) {
    if (v === undefined || v === null || v === '') continue;
    if (Array.isArray(v) && v.length === 0) continue;
    out[k] = v;
  }
  return out as T;
}

function socialLinks(settings: SiteSettings): string[] {
  return Object.values(settings.social || {}).filter(
    (u): u is string => typeof u === 'string' && /^https?:\/\//.test(u.trim())
  );
}

export function getPersonJsonLd(settings: SiteSettings, services: { title: string }[] = []) {
  const contact = settings.contact || ({} as SiteSettings['contact']);
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: settings.name,
    jobTitle: settings.hero?.roleTag,
    description: settings.hero?.subtext,
    url: getSiteUrl(),
    image: settings.hero?.avatar || settings.hero?.image,
    email: contact.email,
    telephone: contact.phone,
    address: contact.location ? { '@type': 'PostalAddress', addressLocality: contact.location } : undefined,
    sameAs: socialLinks(settings),
    knowsAbout: services.map((s) => s.title).filter(Boolean),
  });
}

export function getServiceJsonLd(
  service: { title: string; summary: string; slug: string },
  settings: SiteSettings
) {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.title,
    description: service.summary,
    provider: clean({ '@type': 'Person', name: settings.name, url: getSiteUrl() }),
    url: `${getSiteUrl()}/services/${service.slug}`,
  });
}

export function getArticleJsonLd(
  article: {
    title: string;
    excerpt: string;
    slug: string;
    date: string;
    coverImage?: string;
    author?: { name?: string; role?: string };
  },
  settings: SiteSettings
) {
  return clean({
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.date,
    author: clean({
      '@type': 'Person',
      name: article.author?.name || settings.name,
      jobTitle: article.author?.role,
    }),
    url: `${getSiteUrl()}/blog/${article.slug}`,
    image: article.coverImage,
  });
}
