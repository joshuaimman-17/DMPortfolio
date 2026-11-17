import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { verifyAdminIdToken } from '@/lib/admin-auth';
import { getAdminBucket } from '@/lib/firebase-admin';

export const runtime = 'nodejs';

const ALLOWED_MIME: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
};
const MAX_BYTES = 4 * 1024 * 1024; // images are compressed client-side; hard cap server-side
const ROOT = 'images';

function cleanSegment(input: unknown, fallback: string): string {
  const s = String(input ?? '')
    .toLowerCase()
    .replace(/[^a-z0-9-_]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 60);
  return s || fallback;
}

function downloadUrl(bucket: string, path: string, token: string) {
  return `https://firebasestorage.googleapis.com/v0/b/${bucket}/o/${encodeURIComponent(path)}?alt=media&token=${token}`;
}

/**
 * Admin-only image API backed by Firebase Storage (service account).
 * actions: upload | list | delete
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { idToken, action = 'upload', category, filename, mimeType, base64, path } = body || {};

    const check = await verifyAdminIdToken(idToken);
    if ('error' in check) {
      return NextResponse.json({ error: check.error }, { status: check.status });
    }

    const bucket = getAdminBucket();

    // ---------- LIST ----------
    if (action === 'list' || action === 'listFiles') {
      const prefix = `${ROOT}/${cleanSegment(category, 'general')}/`;
      const [files] = await bucket.getFiles({ prefix, maxResults: 200 });
      const out = files
        .filter((f) => !f.name.endsWith('/'))
        .map((f) => {
          const token = String(f.metadata?.metadata?.firebaseStorageDownloadTokens || '').split(',')[0];
          return {
            id: f.name,
            name: f.name.split('/').pop() || f.name,
            url: token ? downloadUrl(bucket.name, f.name, token) : '',
            updated: f.metadata?.updated || '',
          };
        })
        .filter((f) => f.url)
        .sort((a, b) => String(b.updated).localeCompare(String(a.updated)));
      return NextResponse.json({ files: out });
    }

    // ---------- DELETE ----------
    if (action === 'delete') {
      if (typeof path !== 'string' || !path.startsWith(`${ROOT}/`) || path.includes('..')) {
        return NextResponse.json({ error: 'Invalid file path.' }, { status: 400 });
      }
      await bucket.file(path).delete({ ignoreNotFound: true });
      return NextResponse.json({ ok: true, deleted: path });
    }

    // ---------- UPLOAD ----------
    const ext = ALLOWED_MIME[String(mimeType)];
    if (!ext) {
      return NextResponse.json({ error: 'Only JPG, PNG or WebP images are allowed.' }, { status: 400 });
    }
    if (typeof base64 !== 'string' || !base64) {
      return NextResponse.json({ error: 'No image data received.' }, { status: 400 });
    }
    const buffer = Buffer.from(base64, 'base64');
    if (buffer.length === 0 || buffer.length > MAX_BYTES) {
      return NextResponse.json({ error: 'Image is empty or larger than 4 MB after compression.' }, { status: 413 });
    }

    const baseName = cleanSegment(String(filename || 'image').replace(/\.[^/.]+$/, ''), 'image');
    const filePath = `${ROOT}/${cleanSegment(category, 'general')}/${Date.now()}-${baseName}.${ext}`;
    const token = randomUUID();

    await bucket.file(filePath).save(buffer, {
      resumable: false,
      contentType: mimeType,
      metadata: {
        cacheControl: 'public, max-age=31536000, immutable',
        metadata: { firebaseStorageDownloadTokens: token, uploadedBy: check.email },
      },
    });

    return NextResponse.json({
      id: filePath,
      name: filePath.split('/').pop(),
      url: downloadUrl(bucket.name, filePath, token),
    });
  } catch (err: any) {
    console.error('[api/upload] Error:', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
