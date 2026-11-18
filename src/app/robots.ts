import type { MetadataRoute } from 'next';
import { getSiteUrl } from '@/lib/site-url';
import { ROBOTS_DISALLOW } from '@/lib/indexing';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = getSiteUrl();

  return {
    rules: [
      {
        // All crawlers (search engines and AI bots): every public page allowed,
        // private/auth/API routes blocked (see src/lib/indexing.ts).
        userAgent: '*',
        allow: '/',
        disallow: ROBOTS_DISALLOW, // central policy: src/lib/indexing.ts
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  };
}
