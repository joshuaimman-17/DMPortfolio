import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { verifyAdminIdToken } from '@/lib/admin-auth';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { validateSlug } from '@/lib/slug';
import { isItemKind, saveItem } from '@/lib/item-slug';

/**
 * Rename-safe save for services / works / posts (see lib/item-slug.ts).
 * Body: { idToken, kind: 'service'|'work'|'post', oldSlug: string|null, newSlug: string, payload: object }
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, kind, oldSlug, newSlug, payload } = body || {};

    const check = await verifyAdminIdToken(idToken);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    if (!isItemKind(kind)) return NextResponse.json({ error: 'Invalid item kind.' }, { status: 400 });
    if (typeof newSlug !== 'string') return NextResponse.json({ error: 'Missing slug.' }, { status: 400 });
    const slugProblem = validateSlug(newSlug);
    if (slugProblem) return NextResponse.json({ error: slugProblem }, { status: 400 });
    if (oldSlug !== null && typeof oldSlug !== 'string') {
      return NextResponse.json({ error: 'Invalid previous slug.' }, { status: 400 });
    }
    if (!payload || typeof payload !== 'object' || Array.isArray(payload)) {
      return NextResponse.json({ error: 'Missing item data.' }, { status: 400 });
    }

    let result;
    try {
      result = await saveItem(getAdminFirestore(), {
        kind,
        oldSlug: oldSlug ?? null,
        newSlug,
        payload,
        nowIso: new Date().toISOString(),
      });
    } catch (err: any) {
      if (err?.code === 'NOT_FOUND') return NextResponse.json({ error: err.message, code: err.code }, { status: 404 });
      if (err?.code === 'SLUG_TAKEN' || err?.code === 'SLUG_PREVIOUSLY_USED') {
        return NextResponse.json({ error: err.message, code: err.code }, { status: 409 });
      }
      throw err;
    }

    // Same on-demand revalidation the admin triggers after any content save.
    for (const t of result.tags) revalidateTag(t, 'max');
    for (const p of result.paths) revalidatePath(p);
    for (const p of ['/llms.txt', '/llms-full.txt', '/sitemap.xml']) revalidatePath(p);

    return NextResponse.json({ ok: true, ...result });
  } catch (err: any) {
    console.error('[api/admin/items/save] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
