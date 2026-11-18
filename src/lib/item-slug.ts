/**
 * Rename-safe save for services / works / blog posts.
 *
 * An item's slug is its Firestore document ID, and its SEO metadata lives in
 * `pages_metadata/route_<kind>_<slug>`. Firestore cannot rename a document ID, so changing a slug
 * means: write the doc under the new ID, delete the old one, move the metadata doc, and rewrite
 * every field in other documents that points at the old slug — all in ONE atomic batch.
 * The old slug is kept in `previousSlugs` so the public site can 308-redirect it.
 *
 * Deliberately free of app imports (only a type import) so it can be unit-tested against a fake
 * Firestore without booting Next. Callers must validate the slug format first (see lib/slug.ts).
 */
import type { Firestore } from 'firebase-admin/firestore';

export type ItemKind = 'service' | 'work' | 'post';

export const KIND_COLLECTION: Record<ItemKind, string> = {
  service: 'services',
  work: 'works',
  post: 'posts',
};

export const KIND_ROUTE: Record<ItemKind, string> = {
  service: '/services',
  work: '/works',
  post: '/blog',
};

export const isItemKind = (v: unknown): v is ItemKind => v === 'service' || v === 'work' || v === 'post';

export type SlugErrorCode = 'NOT_FOUND' | 'SLUG_TAKEN' | 'SLUG_PREVIOUSLY_USED';

export function slugError(code: SlugErrorCode, message: string): Error & { code: SlugErrorCode } {
  return Object.assign(new Error(message), { code });
}

export interface SaveItemArgs {
  kind: ItemKind;
  /** Slug the item is stored under now, or null when creating a new item. */
  oldSlug: string | null;
  newSlug: string;
  /** Form data. `id`, `slug`, `previousSlugs`, `updatedAt` are controlled here and ignored if present. */
  payload: Record<string, any>;
  nowIso: string;
}

export interface SaveItemResult {
  renamed: boolean;
  slug: string;
  previousSlugs: string[];
  /** Cache tags and paths the caller should revalidate. */
  tags: string[];
  paths: string[];
}

const replaceSlug = (list: unknown, from: string, to: string): string[] => {
  const arr = Array.isArray(list) ? (list as string[]) : [];
  return Array.from(new Set(arr.map((s) => (s === from ? to : s))));
};

export async function saveItem(db: Firestore, args: SaveItemArgs): Promise<SaveItemResult> {
  const { kind, oldSlug, newSlug, payload, nowIso } = args;
  const col = KIND_COLLECTION[kind];
  const route = KIND_ROUTE[kind];
  const renamed = oldSlug !== null && oldSlug !== newSlug;

  let existing: Record<string, any> | null = null;
  if (oldSlug !== null) {
    const oldSnap = await db.collection(col).doc(oldSlug).get();
    if (!oldSnap.exists) throw slugError('NOT_FOUND', `"${oldSlug}" no longer exists. Reload the admin and try again.`);
    existing = oldSnap.data() as Record<string, any>;
  }

  // --- Conflict checks (only when the target slug is not already this item's own) ---
  if (oldSlug === null || renamed) {
    const taken = await db.collection(col).doc(newSlug).get();
    if (taken.exists) throw slugError('SLUG_TAKEN', `Slug "${newSlug}" is already in use. Please pick another.`);

    const usedBefore = await db.collection(col).where('previousSlugs', 'array-contains', newSlug).get();
    const other = usedBefore.docs.find((d) => d.id !== oldSlug);
    if (other) {
      throw slugError(
        'SLUG_PREVIOUSLY_USED',
        `Slug "${newSlug}" is an old URL that redirects to "${other.id}". Pick another slug, or give that item a different slug first.`
      );
    }
  }

  // --- Slug history. A slug can never be both current and previous. ---
  const history: string[] = Array.isArray(existing?.previousSlugs) ? existing!.previousSlugs : [];
  const previousSlugs = Array.from(new Set(renamed ? [...history, oldSlug as string] : history)).filter((s) => s !== newSlug);

  const doc: Record<string, any> = { ...payload };
  delete doc.id;
  doc.slug = newSlug;
  doc.previousSlugs = previousSlugs;
  doc.updatedAt = nowIso;
  doc.createdAt = existing?.createdAt || payload.createdAt || nowIso;

  const tags = new Set<string>([col]);
  const paths = new Set<string>(['/', route, `${route}/${newSlug}`]);
  const batch = db.batch();

  if (!renamed) {
    batch.set(db.collection(col).doc(newSlug), doc);
    await batch.commit();
    return { renamed: false, slug: newSlug, previousSlugs, tags: [...tags], paths: [...paths] };
  }

  const from = oldSlug as string;
  paths.add(`${route}/${from}`);

  // 1. Item doc: write under new ID, delete old ID.
  if (kind === 'post') doc.relatedSlugs = replaceSlug(doc.relatedSlugs, from, newSlug); // self-reference
  batch.set(db.collection(col).doc(newSlug), doc);
  batch.delete(db.collection(col).doc(from));

  // 2. SEO metadata doc follows the item.
  const metaOld = db.collection('pages_metadata').doc(`route_${kind}_${from}`);
  const metaSnap = await metaOld.get();
  if (metaSnap.exists) {
    batch.set(db.collection('pages_metadata').doc(`route_${kind}_${newSlug}`), metaSnap.data() as Record<string, any>);
    batch.delete(metaOld);
  }

  // 3. Other documents that reference the old slug.
  if (kind === 'work') {
    const services = await db.collection('services').where('relatedWorkSlugs', 'array-contains', from).get();
    for (const d of services.docs) {
      batch.update(d.ref, { relatedWorkSlugs: replaceSlug(d.data().relatedWorkSlugs, from, newSlug) });
      paths.add(`/services/${d.id}`);
      tags.add('services');
    }
    const showcase = await db.collection('showcase').where('workSlug', '==', from).get();
    for (const d of showcase.docs) {
      batch.update(d.ref, { workSlug: newSlug });
      tags.add('showcase');
    }
    paths.add('/services');
  } else if (kind === 'post') {
    const posts = await db.collection('posts').where('relatedSlugs', 'array-contains', from).get();
    for (const d of posts.docs) {
      if (d.id === from) continue; // handled above via `doc`
      batch.update(d.ref, { relatedSlugs: replaceSlug(d.data().relatedSlugs, from, newSlug) });
      paths.add(`/blog/${d.id}`);
    }
  }

  await batch.commit();
  return { renamed: true, slug: newSlug, previousSlugs, tags: [...tags], paths: [...paths] };
}
