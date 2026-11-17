import { NextRequest, NextResponse } from 'next/server';
import { verifyAdminIdToken } from '@/lib/admin-auth';
import { adminNotifyEmail, mailerConfigured, sendMail } from '@/lib/mailer';
import { renderTemplate, SAMPLE_VARS } from '@/types/email-templates';

export const runtime = 'nodejs';

/** Admin-only: sends the (possibly unsaved) template, rendered with sample data, to the admin's own inbox. */
export async function POST(req: NextRequest) {
  try {
    const { idToken, subject, html, fromName } = (await req.json()) || {};

    const check = await verifyAdminIdToken(idToken);
    if ('error' in check) return NextResponse.json({ error: check.error }, { status: check.status });

    if (!mailerConfigured()) {
      return NextResponse.json(
        { error: 'Email is not configured yet. Add GOOGLE_OAUTH_CLIENT_ID/SECRET, GMAIL_REFRESH_TOKEN and GMAIL_SENDER to the environment.' },
        { status: 503 }
      );
    }
    if (typeof subject !== 'string' || typeof html !== 'string' || !subject.trim() || !html.trim()) {
      return NextResponse.json({ error: 'Subject and body are required.' }, { status: 400 });
    }
    if (html.length > 200_000) return NextResponse.json({ error: 'Template is too large.' }, { status: 413 });

    const to = adminNotifyEmail();
    const res = await sendMail({
      to,
      subject: `[TEST] ${renderTemplate(subject, SAMPLE_VARS, { html: false })}`,
      html: renderTemplate(html, SAMPLE_VARS, { html: true }),
      fromName: typeof fromName === 'string' && fromName.trim() ? fromName : SAMPLE_VARS.siteName,
    });
    if (!res.success) return NextResponse.json({ error: res.error || 'Send failed' }, { status: 502 });
    return NextResponse.json({ ok: true, to });
  } catch (err: any) {
    return NextResponse.json({ error: err?.message || 'Server error' }, { status: 500 });
  }
}
