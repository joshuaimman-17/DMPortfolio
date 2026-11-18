/**
 * Central indexing policy — the ONE place that decides what search engines may crawl/index.
 *
 * Rule: every public page is indexable and crawlable, EXCEPT the route prefixes below.
 * Consumed by:
 *   - src/app/robots.ts   -> robots.txt Disallow rules (crawl blocking)
 *   - next.config.ts      -> X-Robots-Tag headers     (index blocking, also covers non-HTML + crawlers that
 *                            ignore robots.txt)
 *
 * Do not add per-page `robots: { index: false }` metadata; add the route here instead.
 * This file must stay dependency-free: next.config.ts imports it directly.
 */

/** Route prefixes that must never be crawled or indexed. Prefix match: '/admin' covers '/admin/**'. */
export const NON_INDEXABLE_PREFIXES = [
  '/admin',
  '/login',
  '/api',
  // Auth-adjacent routes (none exist yet — listed so they are excluded the moment they are added)
  '/signin',
  '/sign-in',
  '/signup',
  '/sign-up',
  '/register',
  '/reset-password',
  '/forgot-password',
  '/verify-email',
  '/auth',
] as const;

/**
 * Query-string variants of otherwise indexable pages that should stay out of the index.
 * These are NOT part of the "private routes" rule above: they are duplicate filtered views
 * (canonical points at the unfiltered page) and are intentionally noindex, follow.
 */
export const NOINDEX_QUERY_VARIANTS = [{ path: '/works', param: 'type' }] as const;

/** robots.txt Disallow entries (each prefix with and without trailing slash). */
export const ROBOTS_DISALLOW: string[] = NON_INDEXABLE_PREFIXES.flatMap((p) => [p, `${p}/`]);

/** `headers()` entries for next.config.ts */
export function indexingHeaders() {
  return [
    ...NON_INDEXABLE_PREFIXES.flatMap((prefix) => [
      { source: prefix, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
      { source: `${prefix}/:path*`, headers: [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] },
    ]),
    ...NOINDEX_QUERY_VARIANTS.map(({ path, param }) => ({
      source: path,
      has: [{ type: 'query' as const, key: param }],
      headers: [{ key: 'X-Robots-Tag', value: 'noindex, follow' }],
    })),
  ];
}
