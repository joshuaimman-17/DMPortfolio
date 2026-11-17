import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { verifyAdminIdToken } from '@/lib/admin-auth';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, tag, tags, path, paths } = body || {};

    const check = await verifyAdminIdToken(idToken);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    // 2. Collect tags and paths to revalidate
    const tagsToRevalidate: string[] = [];
    if (tag && typeof tag === 'string' && tag.trim()) {
      tagsToRevalidate.push(tag.trim());
    }
    if (Array.isArray(tags)) {
      tags.forEach((t) => {
        if (typeof t === 'string' && t.trim()) tagsToRevalidate.push(t.trim());
      });
    }

    const pathsToRevalidate: string[] = [];
    if (path && typeof path === 'string' && path.trim()) {
      pathsToRevalidate.push(path.trim());
    }
    if (Array.isArray(paths)) {
      paths.forEach((p) => {
        if (typeof p === 'string' && p.trim()) pathsToRevalidate.push(p.trim());
      });
    }

    if (tagsToRevalidate.length === 0 && pathsToRevalidate.length === 0) {
      return NextResponse.json(
        { error: 'No tags or paths provided to revalidate.' },
        { status: 400 }
      );
    }

    // 3. Execute Next.js on-demand revalidation
    for (const t of tagsToRevalidate) {
      revalidateTag(t, 'max');
    }

    for (const p of pathsToRevalidate) {
      revalidatePath(p);
    }

    // Generated files that mirror site content must rebuild on every admin save
    for (const p of ['/llms.txt', '/llms-full.txt', '/sitemap.xml', '/robots.txt']) {
      revalidatePath(p);
    }

    // Settings / metadata affect the shared shell (navbar, footer, <head>) on every page
    if (tagsToRevalidate.includes('settings') || tagsToRevalidate.includes('metadata')) {
      revalidatePath('/', 'layout');
    }

    return NextResponse.json({
      revalidated: true,
      tags: tagsToRevalidate,
      paths: pathsToRevalidate,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    console.error('[api/revalidate] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
