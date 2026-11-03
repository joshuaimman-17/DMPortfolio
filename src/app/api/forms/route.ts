import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';

export async function POST(req: NextRequest) {
  try {
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
      return NextResponse.json({ success: true, notified: false });
    }

    // 2. Validate email
    const cleanEmail = (email || '').trim().toLowerCase();
    if (!cleanEmail || !cleanEmail.includes('@') || cleanEmail.length > 150) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    // 3. Validate name for audit / contact
    const cleanName = (name || '').trim();
    if (type !== 'newsletter' && (!cleanName || cleanName.length > 100)) {
      return NextResponse.json(
        { success: false, error: 'Please provide a valid name (1-100 characters).' },
        { status: 400 }
      );
    }

    // 4. Forward to Google Apps Script if APPS_SCRIPT_URL is configured
    let notified = false;
    const appsScriptUrl = process.env.APPS_SCRIPT_URL;
    if (appsScriptUrl) {
      try {
        const scriptPayload = {
          action: 'submitForm',
          type,
          page: sourcePage || '/',
          website: '', // honeypot passed clean
          data: {
            name: cleanName || cleanEmail.split('@')[0],
            email: cleanEmail,
            companyUrl: companyUrl || website || company || '',
            challenge: challenge || '',
            budget: budget || '',
            slot: preferredSlot || slot || '',
            service: service || '',
            message: message || '',
          },
        };

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const scriptRes = await fetch(appsScriptUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'text/plain;charset=utf-8' },
          body: JSON.stringify(scriptPayload),
          signal: controller.signal,
        });
        clearTimeout(timeoutId);

        if (scriptRes.ok) {
          const resData = await scriptRes.json().catch(() => null);
          if (resData && resData.ok !== false) {
            notified = true;
          }
        }
      } catch (scriptErr) {
        console.warn('[api/forms] Google Apps Script forward failed:', scriptErr);
        notified = false;
      }
    }

    // 5. Persist to Firestore
    try {
      const firestore = getAdminFirestore();
      const now = new Date().toISOString();

      if (type === 'newsletter') {
        const subscriberId = cleanEmail.replace(/[^a-zA-Z0-9@._-]/g, '_');
        await firestore.collection('subscribers').doc(subscriberId).set(
          {
            email: cleanEmail,
            notified,
            createdAt: now,
          },
          { merge: true }
        );
      } else {
        await firestore.collection('submissions').add({
          type: type === 'audit' ? 'audit' : 'contact',
          name: cleanName,
          email: cleanEmail,
          company: (company || '').trim().slice(0, 200),
          website: (companyUrl || '').trim().slice(0, 200),
          companyUrl: (companyUrl || '').trim().slice(0, 200),
          message: (message || '').trim().slice(0, 2000),
          challenge: (challenge || '').trim().slice(0, 1000),
          budget: (budget || '').trim().slice(0, 100),
          preferredSlot: (preferredSlot || slot || '').trim().slice(0, 100),
          service: (service || '').trim().slice(0, 100),
          currentMetrics: (currentMetrics || '').trim().slice(0, 500),
          sourcePage: sourcePage || '/',
          status: 'New',
          notified,
          createdAt: now,
        });
      }
    } catch (dbErr) {
      console.warn('[api/forms] Firestore write error:', dbErr);
      // If Apps Script succeeded, still return success to visitor
      if (!notified) {
        return NextResponse.json(
          { success: false, error: 'Failed to record submission. Please reach out directly.' },
          { status: 500 }
        );
      }
    }

    return NextResponse.json({ success: true, notified });
  } catch (err: any) {
    console.error('[api/forms] Request error:', err);
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
