import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag, revalidatePath } from 'next/cache';
import { getAdminAuth, getAdminFirestore } from '@/lib/firebase-admin';

function getAuthorizedAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  const defaults = [
    'joshuaimman8@gmail.com',
    'joshuaimman2004@gmail.com',
    'alex@growthmark.io',
    'jashper078@gmail.com',
  ];
  return Array.from(new Set([...envAdmins, ...defaults]));
}

async function verifyIsAdmin(email: string): Promise<boolean> {
  const adminEmails = getAuthorizedAdminEmails();
  if (adminEmails.includes(email)) {
    return true;
  }
  try {
    const firestore = getAdminFirestore();
    const adminDoc = await firestore.collection('admins').doc(email).get();
    return adminDoc.exists;
  } catch (err) {
    console.warn('[api/revalidate] Error checking Firestore admin doc:', err);
    return false;
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, tag, tags, path, paths } = body || {};

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Authentication required. Missing Firebase ID token.' },
        { status: 401 }
      );
    }

    // 1. Verify Firebase token
    const auth = getAdminAuth();
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch {
      return NextResponse.json(
        { error: 'Invalid or expired Firebase ID token.' },
        { status: 401 }
      );
    }

    const email = (decoded.email || '').toLowerCase().trim();
    if (!decoded.email_verified) {
      return NextResponse.json(
        { error: 'Administrator email must be verified.' },
        { status: 403 }
      );
    }

    const isAdmin = await verifyIsAdmin(email);
    if (!isAdmin) {
      return NextResponse.json(
        { error: 'Access denied. Account is not registered as an administrator.' },
        { status: 403 }
      );
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
