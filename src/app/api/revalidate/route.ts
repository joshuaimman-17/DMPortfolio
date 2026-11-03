import { NextRequest, NextResponse } from 'next/server';
import { revalidateTag } from 'next/cache';
import { getAdminAuth } from '@/lib/firebase-admin';

function getAuthorizedAdminEmails(): string[] {
  const envAdmins = process.env.ADMIN_EMAILS
    ? process.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase()).filter(Boolean)
    : [];
  const defaults = [
    'joshuaimman8@gmail.com',
    'joshuaimman2004@gmail.com',
    'alex@growthmark.io',
  ];
  return Array.from(new Set([...envAdmins, ...defaults]));
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, tag, tags } = body || {};

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Authentication required. Missing Firebase ID token.' },
        { status: 401 }
      );
    }

    // 1. Verify token
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

    const adminEmails = getAuthorizedAdminEmails();
    if (!adminEmails.includes(email)) {
      return NextResponse.json(
        { error: 'Access denied. Account is not registered as an administrator.' },
        { status: 403 }
      );
    }

    // 2. Perform revalidation
    const tagsToRevalidate: string[] = [];
    if (tag && typeof tag === 'string') {
      tagsToRevalidate.push(tag.trim());
    }
    if (Array.isArray(tags)) {
      tags.forEach((t) => {
        if (typeof t === 'string' && t.trim()) tagsToRevalidate.push(t.trim());
      });
    }

    if (tagsToRevalidate.length === 0) {
      return NextResponse.json(
        { error: 'No tags provided to revalidate.' },
        { status: 400 }
      );
    }

    for (const t of tagsToRevalidate) {
      revalidateTag(t, 'max');
    }

    return NextResponse.json({
      revalidated: true,
      tags: tagsToRevalidate,
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
