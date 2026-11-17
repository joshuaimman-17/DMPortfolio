/** Returns a normalized http(s) URL, or '' when the value is empty/invalid (so callers can skip it). */
export function cleanSocialUrl(value: unknown): string {
  if (typeof value !== 'string') return '';
  const s = value.trim();
  if (!s) return '';
  try {
    const u = new URL(s);
    if (u.protocol !== 'https:' && u.protocol !== 'http:') return '';
    if (!u.hostname.includes('.')) return '';
    return u.toString().replace(/\/+$/, '');
  } catch {
    return '';
  }
}
