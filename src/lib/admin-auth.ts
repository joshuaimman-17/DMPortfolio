import 'server-only';
import { getAdminAuth } from '@/lib/firebase-admin';

const DEFAULT_ADMINS = ['premmohan0147@gmail.com'];

function adminEmails(): string[] {
  return DEFAULT_ADMINS;
}

export type AdminCheck =
  | { ok: true; email: string }
  | { ok: false; status: 401 | 403; error: string };

/** Verifies a Firebase ID token belongs to a verified admin. Single source of truth for admin API routes. */
export async function verifyAdminIdToken(idToken: unknown): Promise<AdminCheck> {
  if (!idToken || typeof idToken !== 'string') {
    return { ok: false, status: 401, error: 'Authentication required.' };
  }
  let decoded;
  try {
    decoded = await getAdminAuth().verifyIdToken(idToken, true); // also checks revocation
  } catch {
    return { ok: false, status: 401, error: 'Invalid or expired token.' };
  }
  const email = (decoded.email || '').toLowerCase().trim();
  if (!email || !decoded.email_verified) {
    return { ok: false, status: 403, error: 'Verified email required.' };
  }
  if (adminEmails().includes(email)) return { ok: true, email };
  return { ok: false, status: 403, error: 'Access denied.' };
}
