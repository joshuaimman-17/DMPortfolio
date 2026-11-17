/** Canonical public site URL (no trailing slash). Set NEXT_PUBLIC_APP_URL in every environment. */
export function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.APP_URL ||
    'https://alexriveragrowth.com'
  ).replace(/\/$/, '');
}
