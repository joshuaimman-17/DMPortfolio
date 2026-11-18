/**
 * Maps a stale (renamed) slug to the item's current slug, using each item's `previousSlugs`.
 * Pure and dependency-free so it is trivial to test. Returns null when the slug is unknown.
 *
 * Current slugs always win: if a slug is live on one item and listed as "previous" on another
 * (the save logic prevents this, but data can be edited by hand) it is NOT redirected.
 */
export function findCurrentSlug(
  items: ReadonlyArray<{ slug: string; previousSlugs?: string[] }>,
  requestedSlug: string
): string | null {
  if (items.some((i) => i.slug === requestedSlug)) return null;
  const match = items.find((i) => Array.isArray(i.previousSlugs) && i.previousSlugs.includes(requestedSlug));
  return match ? match.slug : null;
}
