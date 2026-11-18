/**
 * Single source for the public site URL (no trailing slash).
 *
 * To move to a custom domain, set NEXT_PUBLIC_SITE_URL in the environment — no code change needed.
 *
 * Resolution order:
 *  1. NEXT_PUBLIC_SITE_URL   (preferred; inlined into client bundles too)
 *  2. SITE_URL               (server-only)
 *  3. NEXT_PUBLIC_APP_URL / APP_URL  (legacy names, still honoured)
 *  4. DEFAULT_SITE_URL below
 *
 * Vercel's per-deployment URL is deliberately NOT used, so preview deployments never
 * emit canonical/og:url values pointing at a throwaway host.
 */
export const DEFAULT_SITE_URL = 'https://prem-mohan.vercel.app';

export function getSiteUrl(): string {
  const withScheme = (u: string) => (/^https?:\/\//i.test(u) ? u : `https://${u}`).replace(/\/+$/, '');

  // Literal process.env.NEXT_PUBLIC_* accesses are required so Next inlines them in the browser.
  const explicit =
    process.env.NEXT_PUBLIC_SITE_URL ||
    process.env.SITE_URL ||
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL;
  if (explicit && explicit.trim()) return withScheme(explicit.trim());

  return DEFAULT_SITE_URL;
}
