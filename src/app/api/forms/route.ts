import { NextRequest, NextResponse } from 'next/server';
import { getAdminFirestore } from '@/lib/firebase-admin';
import { sendGmail, appendSpreadsheetRow } from '@/lib/workspace';

export async function POST(req: NextRequest) {
  try {
    const authHeader = req.headers.get('Authorization') || '';
    const bearerToken = authHeader.startsWith('Bearer ') ? authHeader.substring(7) : '';

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
      spreadsheetId,
    } = body || {};

    // 1. Silent bot honeypot rejection
    if (website && typeof website === 'string' && website.trim().length > 0) {
      return NextResponse.json({ success: true, notified: false, sheetsSaved: false });
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

    let sheetsSaved = false;
    let adminNotified = false;
    let userConfirmed = false;

    // 4. Forward to Google Apps Script (handles Google Sheets + Gmail confirmation & notification)
    const appsScriptUrl =
      process.env.APPS_SCRIPT_URL ||
      process.env.NEXT_PUBLIC_APPS_SCRIPT_URL ||
      process.env.VITE_APPS_SCRIPT_URL ||
      process.env.NEXT_PUBLIC_VITE_APPS_SCRIPT_URL;

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
            company: company || '',
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
            sheetsSaved = resData.sheetsSaved !== false;
            adminNotified = resData.adminNotified !== false;
            userConfirmed = resData.userConfirmed !== false;
          }
        }
      } catch (scriptErr) {
        console.warn('[api/forms] Google Apps Script sync warning:', scriptErr);
      }
    }

    // 5. Direct Workspace Fallback: if bearerToken and spreadsheetId provided and not saved yet
    if (bearerToken && spreadsheetId && !sheetsSaved) {
      try {
        const row = [
          new Date().toISOString(),
          cleanName,
          cleanEmail,
          companyUrl || company || '',
          challenge || service || '',
          budget || '',
          preferredSlot || slot || '',
          message || '',
          sourcePage || '/',
        ];
        const targetSheet = type === 'audit' ? 'Growth Audits!A:I' : type === 'newsletter' ? 'Subscribers!A:C' : 'Contact Inquiries!A:I';
        const sheetsRes = await appendSpreadsheetRow(bearerToken, spreadsheetId, targetSheet, row);
        if (sheetsRes.success) {
          sheetsSaved = true;
        }
      } catch (sheetsErr) {
        console.warn('[api/forms] Direct Sheets append warning:', sheetsErr);
      }
    }

    // 6. Direct Gmail Fallback: if bearerToken provided and user not confirmed yet
    if (bearerToken && !userConfirmed) {
      try {
        const userSubject =
          type === 'audit'
            ? 'Confirmed: Your Growth Audit with Alex Rivera'
            : type === 'newsletter'
            ? 'Welcome to Growth Dispatch — Alex Rivera'
            : 'Message Received — Alex Rivera Growth Advisory';

        const userHtml = `
          <div style="font-family: sans-serif; max-width: 600px; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
            <h2 style="color: #2563eb;">Submission Confirmed</h2>
            <p>Hi ${cleanName || 'there'},</p>
            <p>Thank you for submitting your details. Your request has been recorded into our Google Sheets pipeline and Alex has been notified.</p>
            <p>We will review your diagnostic notes and reply within 24 hours.</p>
            <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;" />
            <p style="font-size: 12px; color: #64748b;">Alex Rivera &bull; Performance Marketing &amp; SEO Growth Portfolio</p>
          </div>
        `;

        const gmailRes = await sendGmail(bearerToken, {
          to: cleanEmail,
          subject: userSubject,
          htmlBody: userHtml,
        });

        if (gmailRes.success) {
          userConfirmed = true;
        }
      } catch (gmailErr) {
        console.warn('[api/forms] Direct Gmail send warning:', gmailErr);
      }
    }

    // 7. Persist to Firestore
    try {
      const firestore = getAdminFirestore();
      const now = new Date().toISOString();

      if (type === 'newsletter') {
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
    return NextResponse.json(
      { success: false, error: err?.message || 'Internal server error' },
      { status: 500 }
    );
  }
}
