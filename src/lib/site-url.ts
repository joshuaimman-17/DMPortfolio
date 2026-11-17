/**
 * Single source for the public site URL (no trailing slash).
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_APP_URL (set this in every environment)
 *  2. APP_URL
 *  3. Vercel's production domain (VERCEL_PROJECT_PRODUCTION_URL) or deployment URL (VERCEL_URL)
 *  4. In the browser: window.location.origin
 *  5. http://localhost:3000
 */
export function getSiteUrl(): string {
  const withScheme = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`).replace(/\/+$/, '');

  const explicit = process.env.NEXT_PUBLIC_APP_URL || process.env.APP_URL;
  if (explicit) return withScheme(explicit.trim());

  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;
  if (vercel) return withScheme(vercel.trim());

  if (typeof window !== 'undefined') return window.location.origin;
  return 'http://localhost:3000';
}
