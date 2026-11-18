export const SLUG_MAX_LENGTH = 80;
const SLUG_RE = /^[a-z0-9]+(-[a-z0-9]+)*$/;

/** Returns an error message when the slug is not URL-safe, or null when valid. */
export function validateSlug(slug: string): string | null {
  const s = (slug || '').trim();
  if (!s) return 'Please enter a unique URL slug';
  if (s.length > SLUG_MAX_LENGTH) {
    return `URL slug is too long (${s.length} characters). Use ${SLUG_MAX_LENGTH} or fewer.`;
  }
  if (!SLUG_RE.test(s)) {
    return 'URL slug may only contain lowercase letters, numbers and single hyphens (e.g. "seo-audit-guide"). No spaces, capitals, underscores or leading/trailing hyphens.';
  }
  return null;
}

/** Builds a valid slug from a title (lowercase, hyphen-separated, trimmed to SLUG_MAX_LENGTH). */
export function slugifyTitle(title: string): string {
  return (title || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, SLUG_MAX_LENGTH)
    .replace(/-+$/g, '');
}
