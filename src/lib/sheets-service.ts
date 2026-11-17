import 'server-only';
import { createSign } from 'crypto';
import { appendSpreadsheetRow } from './workspace';

let cached: { token: string; exp: number } | null = null;

function b64url(input: string | Buffer) {
  return Buffer.from(input).toString('base64url');
}

/** Mints a Sheets-scoped access token from the Firebase service-account env vars. */
async function getServiceAccountToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;

  const email = process.env.FIREBASE_CLIENT_EMAIL;
  let key = process.env.FIREBASE_PRIVATE_KEY;
  if (!email || !key) throw new Error('FIREBASE_CLIENT_EMAIL / FIREBASE_PRIVATE_KEY not set');
  key = key.trim().replace(/^["']|["']$/g, '').replace(/\n/g, '\n');

  const now = Math.floor(Date.now() / 1000);
  const header = b64url(JSON.stringify({ alg: 'RS256', typ: 'JWT' }));
  const claim = b64url(
    JSON.stringify({
      iss: email,
      scope: 'https://www.googleapis.com/auth/spreadsheets',
      aud: 'https://oauth2.googleapis.com/token',
      iat: now,
      exp: now + 3600,
    })
  );
  const signature = createSign('RSA-SHA256').update(`${header}.${claim}`).sign(key).toString('base64url');

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
      assertion: `${header}.${claim}.${signature}`,
    }),
  });
  const data = await res.json();
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || `Token request failed (${res.status})`);
  }
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return cached.token;
}

/** Appends a form row to the first tab of GOOGLE_SHEET_ID using the service account. */
export async function appendFormRowAsServiceAccount(row: any[]) {
  const sheetId = process.env.GOOGLE_SHEET_ID;
  if (!sheetId) return { success: false, error: 'GOOGLE_SHEET_ID not set' };
  try {
    const token = await getServiceAccountToken();
    return await appendSpreadsheetRow(token, sheetId, 'A:J', row);
  } catch (e: any) {
    return { success: false, error: e?.message || 'Service account append failed' };
  }
}
