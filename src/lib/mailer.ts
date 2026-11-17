import 'server-only';
import { sendGmail } from '@/lib/workspace';
import { getAdminFirestore } from '@/lib/firebase-admin';
import {
  mergeEmailTemplates,
  renderTemplate,
  type EmailTemplatesConfig,
  type TemplateKey,
  type TemplateVars,
} from '@/types/email-templates';

/**
 * Sends mail through the Gmail API using an OAuth refresh token for GMAIL_SENDER.
 * (A service account cannot send for a normal @gmail.com address.)
 */

let cached: { token: string; exp: number } | null = null;

export function mailerConfigured(): boolean {
  return !!(
    process.env.GOOGLE_OAUTH_CLIENT_ID &&
    process.env.GOOGLE_OAUTH_CLIENT_SECRET &&
    process.env.GMAIL_REFRESH_TOKEN &&
    process.env.GMAIL_SENDER
  );
}

export function adminNotifyEmail(): string {
  return process.env.ADMIN_NOTIFY_EMAIL || process.env.GMAIL_SENDER || '';
}

async function getAccessToken(): Promise<string> {
  if (cached && cached.exp > Date.now() + 60_000) return cached.token;

  const res = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_OAUTH_CLIENT_ID || '',
      client_secret: process.env.GOOGLE_OAUTH_CLIENT_SECRET || '',
      refresh_token: process.env.GMAIL_REFRESH_TOKEN || '',
      grant_type: 'refresh_token',
    }),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || !data.access_token) {
    throw new Error(data.error_description || data.error || `Token refresh failed (${res.status})`);
  }
  cached = { token: data.access_token, exp: Date.now() + (data.expires_in || 3600) * 1000 };
  return cached.token;
}

export async function sendMail(opts: {
  to: string;
  subject: string;
  html: string;
  fromName?: string;
  replyTo?: string;
}): Promise<{ success: boolean; error?: string }> {
  if (!mailerConfigured()) return { success: false, error: 'Email is not configured (missing GMAIL_* env vars).' };
  try {
    const token = await getAccessToken();
    const res = await sendGmail(token, {
      to: opts.to,
      subject: opts.subject,
      htmlBody: opts.html,
      fromName: opts.fromName,
      fromEmail: process.env.GMAIL_SENDER,
      replyTo: opts.replyTo,
    });
    return { success: res.success, error: res.error };
  } catch (e: any) {
    return { success: false, error: e?.message || 'Failed to send email' };
  }
}

/** Loads admin-edited templates fresh on every send (no caching → edits apply immediately). */
export async function loadEmailTemplates(): Promise<EmailTemplatesConfig> {
  try {
    const snap = await getAdminFirestore().collection('email_templates').doc('config').get();
    return mergeEmailTemplates(snap.exists ? (snap.data() as any) : null);
  } catch (e) {
    console.warn('[mailer] Could not load email templates, using defaults:', e);
    return mergeEmailTemplates(null);
  }
}

/** Renders + sends one of the six templates. Returns whether a mail was actually sent. */
export async function sendTemplatedMail(
  config: EmailTemplatesConfig,
  key: TemplateKey,
  to: string,
  vars: TemplateVars,
  replyTo?: string
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  const tpl = config.templates[key];
  if (!tpl.enabled) return { success: false, skipped: true };
  if (!to) return { success: false, error: 'No recipient' };
  return sendMail({
    to,
    subject: renderTemplate(tpl.subject, vars, { html: false }),
    html: renderTemplate(tpl.html, vars, { html: true }),
    fromName: config.fromName || vars.siteName,
    replyTo,
  });
}
