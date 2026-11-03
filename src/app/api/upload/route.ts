import { NextRequest, NextResponse } from 'next/server';
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
    const { idToken, action, category, filename, mimeType, base64 } = body || {};

    if (!idToken || typeof idToken !== 'string') {
      return NextResponse.json(
        { error: 'Authentication required. Missing Firebase ID token.' },
        { status: 401 }
      );
    }

    // 1. Verify token with Firebase Admin
    const auth = getAdminAuth();
    let decoded;
    try {
      decoded = await auth.verifyIdToken(idToken);
    } catch (authErr: any) {
      return NextResponse.json(
        { error: 'Invalid or expired Firebase ID token.', details: authErr?.message },
        { status: 401 }
      );
    }

    // 2. Validate email verification and admin email list
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

    // 3. Forward to Apps Script
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    if (!appsScriptUrl) {
      return NextResponse.json(
        { error: 'Google Apps Script URL is not configured on the server.' },
        { status: 500 }
      );
    }

    const scriptSecret = process.env.APPS_SCRIPT_SECRET || '';
    const scriptPayload = {
      action: action || 'upload',
      category: category || 'general',
      filename,
      mimeType,
      base64,
      secret: scriptSecret,
      userEmail: email,
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    const res = await fetch(appsScriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8',
      },
      body: JSON.stringify(scriptPayload),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json(
        { error: `Apps Script returned HTTP ${res.status}: ${res.statusText}` },
        { status: res.status }
      );
    }

    const text = await res.text();
    let data;
    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON returned from Google Apps Script' },
        { status: 502 }
      );
    }

    return NextResponse.json(data);
  } catch (err: any) {
    console.error('[api/upload] Error:', err);
    return NextResponse.json(
      { error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
