import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { appendFormRowAsServiceAccount } from '@/lib/sheets-service';
import { adminNotifyEmail, loadEmailTemplates, sendTemplatedMail } from '@/lib/mailer';
import { getSiteSettings } from '@/lib/data';
import type { FormKind, TemplateVars } from '@/types/email-templates';

export const runtime = 'nodejs';

// Light in-memory throttle so the public endpoint can't be used as a mail relay.
// (Per serverless instance — a deterrent, not a hard guarantee.)
const hits = new Map<string, number[]>();
function throttled(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const recent = (hits.get(key) || []).filter((t) => now - t < windowMs);
  if (recent.length >= max) {
    hits.set(key, recent);
    return true;
  }
  recent.push(now);
  hits.set(key, recent);
  if (hits.size > 5000) hits.clear();
  return false;
}

const clip = (v: unknown, n: number) => String(v ?? '').trim().slice(0, n);

export async function POST(req: NextRequest) {
  try {
    const ip = (req.headers.get('x-forwarded-for') || '').split(',')[0].trim() || 'unknown';
    if (throttled(`ip:${ip}`, 10, 60_000)) {
      return NextResponse.json({ success: false, error: 'Too many requests. Please try again shortly.' }, { status: 429 });
    }

    const body = await req.json();
    const {
      type,
      name,
      email,
      website, // honeypot field
      company,
      companyUrl,
      message,
      challenge,
      budget,
      preferredSlot,
      slot,
      service,
      currentMetrics,
      sourcePage,
    } = body || {};

    // 1. Silent bot honeypot rejection
    if (website && typeof website === 'string' && website.trim().length > 0) {
      return NextResponse.json({ success: true, notified: false, sheetsSaved: false });
    }

    // 2. Validate email
    const cleanEmail = clip(email, 150).toLowerCase();
    if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
      return NextResponse.json({ success: false, error: 'Please provide a valid email address.' }, { status: 400 });
    }
    if (throttled(`email:${cleanEmail}`, 3, 60 * 60_000)) {
      return NextResponse.json(
        { success: false, error: 'We already received your request. We will be in touch soon.' },
        { status: 429 }
      );
    }

    // 3. Validate name for audit / contact
    const kind: FormKind = type === 'audit' ? 'audit' : type === 'newsletter' ? 'newsletter' : 'contact';
    const cleanName = clip(name, 100);
    if (kind !== 'newsletter' && !cleanName) {
      return NextResponse.json({ success: false, error: 'Please provide a valid name (1-100 characters).' }, { status: 400 });
    }

    const slotValue = clip(preferredSlot || slot, 100);
    const vars: TemplateVars = {
      siteName: '',
      name: cleanName || cleanEmail.split('@')[0],
      email: cleanEmail,
      company: clip(company, 200),
      website: clip(companyUrl || company, 200),
      challenge: clip(challenge, 1000),
      budget: clip(budget, 100),
      slot: slotValue,
      service: clip(service, 100),
      message: clip(message, 2000),
      page: clip(sourcePage, 200) || '/',
      timestamp: new Date().toUTCString(),
    };

    let sheetsSaved = false;
    let adminNotified = false;
    let userConfirmed = false;

    // 4. Save to Google Sheet (Firebase service account)
    try {
      const saRes = await appendFormRowAsServiceAccount([
        new Date().toISOString(),
        kind,
        cleanName,
        cleanEmail,
        vars.website || '',
        vars.challenge || vars.service || '',
        vars.budget || '',
        slotValue,
        vars.message || '',
        vars.page || '/',
      ]);
      if (saRes.success) sheetsSaved = true;
      else console.warn('[api/forms] Sheets warning:', saRes.error);
    } catch (saErr) {
      console.warn('[api/forms] Sheets error:', saErr);
    }

    // 5. Emails (admin notification + visitor confirmation) from admin-editable templates.
    //    Awaited before responding — serverless functions are frozen once the response is sent.
    try {
      const [config, settings] = await Promise.all([loadEmailTemplates(), getSiteSettings().catch(() => null)]);
      vars.siteName = settings?.name || 'Our team';
      const adminTo = adminNotifyEmail();

      const [adminRes, visitorRes] = await Promise.allSettled([
        sendTemplatedMail(config, `${kind}_admin`, adminTo, vars, cleanEmail),
        sendTemplatedMail(config, `${kind}_visitor`, cleanEmail, vars, adminTo || undefined),
      ]);
      if (adminRes.status === 'fulfilled') {
        adminNotified = adminRes.value.success;
        if (adminRes.value.error) console.warn('[api/forms] Admin email failed:', adminRes.value.error);
      }
      if (visitorRes.status === 'fulfilled') {
        userConfirmed = visitorRes.value.success;
        if (visitorRes.value.error) console.warn('[api/forms] Visitor email failed:', visitorRes.value.error);
      }
    } catch (mailErr) {
      console.warn('[api/forms] Email step failed:', mailErr);
    }

    // 6. Persist to Firestore
    try {
      const firestore = getAdminFirestore();
      const now = new Date().toISOString();

      if (kind === 'newsletter') {
        const subscriberId = cleanEmail.replace(/[^a-zA-Z0-9@._-]/g, '_');
        await firestore.collection('subscribers').doc(subscriberId).set(
          {
            email: cleanEmail,
            sheetsSaved,
            adminNotified,
            userConfirmed,
            notified: adminNotified || userConfirmed,
            createdAt: now,
          },
          { merge: true }
        );
      } else {
        await firestore.collection('submissions').add({
          type: kind,
          name: cleanName,
          email: cleanEmail,
          company: vars.company,
          website: vars.website,
          companyUrl: vars.website,
          message: vars.message,
          challenge: vars.challenge,
          budget: vars.budget,
          preferredSlot: slotValue,
          service: vars.service,
          currentMetrics: clip(currentMetrics, 500),
          sourcePage: vars.page,
          status: 'New',
          sheetsSaved,
          adminNotified,
          userConfirmed,
          notified: adminNotified || userConfirmed,
          createdAt: now,
        });
      }
    } catch (dbErr) {
      console.warn('[api/forms] Firestore write error:', dbErr);
      if (!sheetsSaved && !adminNotified) {
        return NextResponse.json(
          { success: false, error: 'Failed to record submission. Please reach out directly.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({
      success: true,
      sheetsSaved,
      adminNotified,
      userConfirmed,
      notified: adminNotified || userConfirmed,
    });
  } catch (err: any) {
    console.error('[api/forms] Request error:', err);
    return NextResponse.json({ success: false, error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
