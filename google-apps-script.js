/**
 * Google Apps Script Web App for Alex Rivera Portfolio
 * 
 * Provides:
 * 1. Google Sheets storage for audits, contact inquiries, and newsletter subscribers
 * 2. Automated personalized confirmation email sent to the user via Gmail
 * 3. Instant alert notification email sent to the administrator via Gmail
 * 4. Google Drive image uploads & file listing by category
 * 
 * SETUP INSTRUCTIONS:
 * 1. Go to https://script.google.com/
 * 2. Create or open project: "Alex Rivera Portfolio Backend"
 * 3. Replace all code in Code.gs with this entire file
 * 4. Verify ADMIN_EMAIL below is your administrator email: joshuaimman2004@gmail.com
 * 5. Click "Deploy" > "New deployment"
 * 6. Select type: "Web app"
 * 7. Execute as: "Me"
 * 8. Who has access: "Anyone" (allows public visitor form submission without login)
 * 9. Click "Deploy" and authorize permissions (Spreadsheets, Gmail, Drive)
 * 10. Copy the Web App URL and set it as NEXT_PUBLIC_APPS_SCRIPT_URL (or APPS_SCRIPT_URL)
 */

const ADMIN_EMAIL = 'joshuaimman2004@gmail.com';
const ROOT_FOLDER_NAME = 'Alex Rivera Portfolio Assets';

const FOLDER_MAP = {
  poster: 'posters',
  posters: 'posters',
  analytics: 'analytics',
  'seo-site': 'seo-sites',
  'seo-sites': 'seo-sites',
  social: 'social',
  ad: 'ads',
  ads: 'ads',
  cover: 'covers',
  covers: 'covers',
  testimonial: 'testimonials',
  testimonials: 'testimonials',
  general: 'general'
};

function doPost(e) {
  try {
    if (!e || !e.postData || !e.postData.contents) {
      return jsonResponse({ ok: false, error: 'Empty request body' });
    }

    const payload = JSON.parse(e.postData.contents);
    const action = payload.action;

    if (action === 'submitForm') {
      return handleSubmitForm(payload);
    } else if (action === 'upload') {
      return handleUpload(payload);
    } else if (action === 'listFiles') {
      return handleListFiles(payload);
    } else {
      return jsonResponse({ ok: false, error: 'Unrecognized action: ' + action });
    }
  } catch (err) {
    return jsonResponse({ ok: false, error: err.toString() });
  }
}

function doGet(e) {
  return jsonResponse({
    ok: true,
    message: 'Alex Rivera Portfolio Apps Script Web App is active and ready.',
    adminEmail: ADMIN_EMAIL,
    features: ['Google Sheets sync', 'User confirmation email via Gmail', 'Admin notification email via Gmail', 'Google Drive storage']
  });
}

/**
 * Handle form submissions:
 * 1. Save data into Google Sheets
 * 2. Send instant alert notification to Admin
 * 3. Send detailed confirmation email to User
 */
function handleSubmitForm(payload) {
  // Honeypot check for spam bots
  if (payload.website && payload.website.trim() !== '') {
    return jsonResponse({ ok: true, message: 'Submission received' }); // Silently drop spam
  }

  const type = payload.type || 'contact';
  const page = payload.page || 'Home';
  const data = payload.data || {};
  const timestamp = new Date();
  const cleanEmail = (data.email || '').trim().toLowerCase();

  let sheetsSaved = false;
  let adminNotified = false;
  let userConfirmed = false;

  // 1. SAVE TO GOOGLE SHEETS
  try {
    const spreadsheet = getOrCreateSpreadsheet();

    if (type === 'audit') {
      const sheet = getOrCreateSheet(spreadsheet, 'Growth Audits', [
        'Timestamp', 'Name', 'Email', 'Company URL', 'Primary Challenge', 'Monthly Budget', 'Preferred Slot', 'Source Page'
      ]);
      sheet.appendRow([
        timestamp,
        data.name || 'Anonymous',
        cleanEmail,
        data.companyUrl || data.url || data.company || '',
        data.challenge || data.focus || '',
        data.budget || '',
        data.slot || data.preferredSlot || '',
        page
      ]);
      sheetsSaved = true;

    } else if (type === 'newsletter') {
      const sheet = getOrCreateSheet(spreadsheet, 'Newsletter Subscribers', [
        'Timestamp', 'Email', 'Source Page'
      ]);
      sheet.appendRow([timestamp, cleanEmail, page]);
      sheetsSaved = true;

    } else {
      // Direct contact form
      const sheet = getOrCreateSheet(spreadsheet, 'Contact Inquiries', [
        'Timestamp', 'Name', 'Email', 'Company / URL', 'Service', 'Budget', 'Message', 'Source Page'
      ]);
      sheet.appendRow([
        timestamp,
        data.name || 'Anonymous',
        cleanEmail,
        data.company || data.companyUrl || '',
        data.service || '',
        data.budget || '',
        data.message || '',
        page
      ]);
      sheetsSaved = true;
    }
  } catch (err) {
    Logger.log('Google Sheets error: ' + err.toString());
  }

  // 2. SEND ADMIN NOTIFICATION EMAIL VIA GMAIL
  try {
    if (type === 'audit') {
      const adminSubject = `🚀 New Growth Audit Booking Request: ${data.name || cleanEmail}`;
      const adminHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
          <div style="border-bottom: 2px solid #2563eb; padding-bottom: 16px; margin-bottom: 20px;">
            <span style="background-color: #dbeafe; color: #1e40af; font-size: 11px; font-weight: bold; text-transform: uppercase; padding: 4px 8px; border-radius: 6px;">New Lead</span>
            <h2 style="color: #0f172a; margin: 8px 0 0 0; font-size: 20px;">Growth Diagnostic Audit Request</h2>
          </div>
          <table style="width: 100%; border-collapse: collapse; font-size: 14px; color: #334155;">
            <tr><td style="padding: 8px 0; font-weight: 600; width: 140px; color: #64748b;">Client Name:</td><td style="color: #0f172a; font-weight: bold;">${escapeHtml(data.name || 'N/A')}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Email Address:</td><td><a href="mailto:${escapeHtml(cleanEmail)}" style="color: #2563eb; font-weight: bold;">${escapeHtml(cleanEmail)}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Website URL:</td><td><a href="${escapeHtml(data.companyUrl || data.url || '')}" target="_blank" style="color: #2563eb;">${escapeHtml(data.companyUrl || data.url || 'Not provided')}</a></td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Growth Challenge:</td><td style="color: #0f172a;">${escapeHtml(data.challenge || data.focus || 'N/A')}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Monthly Ad Spend:</td><td style="color: #15803d; font-weight: bold;">${escapeHtml(data.budget || 'N/A')}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Preferred Slot:</td><td>${escapeHtml(data.slot || data.preferredSlot || 'N/A')}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Submitted From:</td><td>${escapeHtml(page)}</td></tr>
            <tr><td style="padding: 8px 0; font-weight: 600; color: #64748b;">Timestamp:</td><td>${timestamp.toUTCString()}</td></tr>
          </table>
          <div style="margin-top: 24px; padding-top: 16px; border-top: 1px solid #e2e8f0; text-align: center;">
            <a href="mailto:${escapeHtml(cleanEmail)}?subject=Re:%20Growth%20Diagnostic%20Session" style="display: inline-block; background-color: #2563eb; color: #ffffff; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 13px;">Reply Directly via Gmail</a>
          </div>
        </div>
      `;
      sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);
      adminNotified = true;

    } else if (type === 'newsletter') {
      const adminSubject = `📩 New Subscriber: ${cleanEmail}`;
      const adminHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0f172a; margin-top: 0;">New Newsletter Subscriber</h3>
          <p style="color: #334155; font-size: 14px;">A visitor subscribed to the Growth Dispatch newsletter:</p>
          <p style="font-size: 16px; font-weight: bold; color: #2563eb;">${escapeHtml(cleanEmail)}</p>
          <p style="color: #64748b; font-size: 12px;">Source: ${escapeHtml(page)} | ${timestamp.toUTCString()}</p>
        </div>
      `;
      sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);
      adminNotified = true;

    } else {
      const adminSubject = `💼 Inbound Contact Inquiry: ${data.name || cleanEmail}`;
      const adminHtml = `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e2e8f0; border-radius: 12px;">
          <h3 style="color: #0f172a; margin-top: 0; font-size: 20px;">New Inbound Contact Message</h3>
          <table style="width: 100%; font-size: 14px; color: #334155;">
            <tr><td style="padding: 6px 0; width: 120px; color: #64748b; font-weight: 600;">Name:</td><td style="color: #0f172a; font-weight: bold;">${escapeHtml(data.name || 'N/A')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Email:</td><td><a href="mailto:${escapeHtml(cleanEmail)}" style="color: #2563eb; font-weight: bold;">${escapeHtml(cleanEmail)}</a></td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Company/Site:</td><td>${escapeHtml(data.company || data.companyUrl || 'N/A')}</td></tr>
            <tr><td style="padding: 6px 0; color: #64748b; font-weight: 600;">Message:</td><td style="color: #0f172a; background-color: #f8fafc; padding: 12px; border-radius: 8px;">${escapeHtml(data.message || 'No message provided')}</td></tr>
          </table>
          <div style="margin-top: 20px; text-align: center;">
            <a href="mailto:${escapeHtml(cleanEmail)}" style="background-color: #0f172a; color: #ffffff; padding: 10px 18px; border-radius: 8px; text-decoration: none; font-weight: 600; font-size: 13px;">Reply to ${escapeHtml(data.name || 'Prospect')}</a>
          </div>
        </div>
      `;
      sendEmail(ADMIN_EMAIL, adminSubject, adminHtml);
      adminNotified = true;
    }
  } catch (err) {
    Logger.log('Admin notification error: ' + err.toString());
  }

  // 3. SEND PERSONALIZED CONFIRMATION EMAIL TO THE USER VIA GMAIL
  try {
    if (cleanEmail && cleanEmail.includes('@')) {
      if (type === 'audit') {
        const userSubject = `Confirmation: Your Growth Audit Request with Alex Rivera`;
        const userHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <div style="text-align: center; margin-bottom: 24px;">
              <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #2563eb;">Alex Rivera | Growth Advisory</span>
              <h1 style="color: #0f172a; font-size: 24px; font-weight: 800; margin: 8px 0 0 0;">Growth Audit Request Confirmed</h1>
              <p style="color: #64748b; font-size: 14px; margin-top: 6px;">Thank you for reserving a complimentary 30-minute diagnostic session.</p>
            </div>

            <div style="background-color: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
              <h3 style="font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569; margin: 0 0 12px 0;">Summary of Your Intake</h3>
              <ul style="list-style: none; padding: 0; margin: 0; font-size: 14px; line-height: 1.8; color: #334155;">
                <li><strong>Website / Company:</strong> ${escapeHtml(data.companyUrl || data.url || data.company || 'Provided')}</li>
                <li><strong>Primary Objective / Challenge:</strong> ${escapeHtml(data.challenge || data.focus || 'Performance Scaling')}</li>
                <li><strong>Monthly Spend Tier:</strong> ${escapeHtml(data.budget || 'Not specified')}</li>
                <li><strong>Preferred Slot:</strong> ${escapeHtml(data.slot || data.preferredSlot || 'This week')}</li>
              </ul>
            </div>

            <div style="margin-bottom: 24px; font-size: 14px; line-height: 1.6; color: #334155;">
              <p><strong>What happens next?</strong></p>
              <ol style="padding-left: 20px; margin: 8px 0;">
                <li>I will run an initial conversion and search presence crawl on your site.</li>
                <li>You will receive a Google Meet calendar invite matching your preferred availability window within 24 business hours.</li>
                <li>In our 30-minute working call, we will walk through actionable growth levers and unit economics improvements.</li>
              </ol>
            </div>

            <div style="border-top: 1px solid #e2e8f0; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">Have immediate questions? You can reply directly to this email or connect on LinkedIn.</p>
              <p style="margin: 6px 0 0 0;"><strong>Alex Rivera</strong> &bull; Senior Growth Marketer &bull; Performance &amp; SEO</p>
            </div>
          </div>
        `;
        sendEmail(cleanEmail, userSubject, userHtml);
        userConfirmed = true;

      } else if (type === 'newsletter') {
        const userSubject = `Welcome to Growth Dispatch — Alex Rivera`;
        const userHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 540px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #2563eb;">Growth Dispatch</span>
            <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 8px 0 16px 0;">You're subscribed!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Welcome! Every two weeks, you'll receive unfiltered performance marketing case studies, technical SEO algorithm teardowns, and actionable ROAS scaling tactics.
            </p>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              In the meantime, feel free to explore my full collection of growth playbooks and interactive calculators on the portfolio.
            </p>
            <div style="border-top: 1px solid #e2e8f0; padding-top: 16px; margin-top: 24px; font-size: 12px; color: #94a3b8;">
              <p style="margin: 0;">Alex Rivera &bull; Performance Marketing &amp; SEO Growth</p>
            </div>
          </div>
        `;
        sendEmail(cleanEmail, userSubject, userHtml);
        userConfirmed = true;

      } else {
        const userSubject = `Message Received — Alex Rivera Growth Advisory`;
        const userHtml = `
          <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; border: 1px solid #e2e8f0; border-radius: 16px; background-color: #ffffff; color: #1e293b;">
            <span style="font-size: 11px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #2563eb;">Alex Rivera Portfolio</span>
            <h2 style="color: #0f172a; font-size: 22px; font-weight: 800; margin: 8px 0 16px 0;">Thanks for getting in touch, ${escapeHtml(data.name || 'there')}!</h2>
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              I have received your inquiry regarding your growth objectives. I review all inquiries personally and will respond within 24 business hours.
            </p>
            ${data.message ? `
              <div style="background-color: #f8fafc; border-left: 3px solid #2563eb; padding: 12px 16px; border-radius: 4px; margin: 16px 0; font-size: 13px; color: #475569; font-style: italic;">
                "${escapeHtml(data.message)}"
              </div>
            ` : ''}
            <p style="font-size: 14px; line-height: 1.6; color: #334155;">
              Talk soon,<br/>
              <strong>Alex Rivera</strong><br/>
              <span style="font-size: 12px; color: #64748b;">Performance Marketing &amp; SEO Growth Advisory</span>
            </p>
          </div>
        `;
        sendEmail(cleanEmail, userSubject, userHtml);
        userConfirmed = true;
      }
    }
  } catch (err) {
    Logger.log('User confirmation error: ' + err.toString());
  }

  return jsonResponse({
    ok: true,
    sheetsSaved: sheetsSaved,
    adminNotified: adminNotified,
    userConfirmed: userConfirmed,
    message: 'Form successfully logged to Google Sheets, admin notified, and user confirmation email sent.'
  });
}

/**
 * Handle image uploads to Google Drive categorized folders
 */
function handleUpload(payload) {
  const category = payload.category || 'general';
  const folderName = FOLDER_MAP[category] || 'general';
  const filename = payload.filename || `asset_${Date.now()}.jpg`;
  const mimeType = payload.mimeType || 'image/jpeg';
  const base64 = payload.base64;

  if (!base64) {
    return jsonResponse({ ok: false, error: 'No image data provided' });
  }

  const folder = getCategoryFolder(folderName);
  const decodedBlob = Utilities.newBlob(Utilities.base64Decode(base64), mimeType, filename);
  const file = folder.createFile(decodedBlob);
  
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);

  const fileId = file.getId();
  const url = `https://drive.google.com/thumbnail?id=${fileId}&sz=w1600`;
  const viewUrl = file.getUrl();

  return jsonResponse({
    ok: true,
    id: fileId,
    fileId: fileId,
    url: url,
    viewUrl: viewUrl
  });
}

/**
 * List existing images from a category folder in Google Drive
 */
function handleListFiles(payload) {
  const category = payload.category || 'general';
  const folderName = FOLDER_MAP[category] || 'general';
  const folder = getCategoryFolder(folderName);
  const filesIter = folder.getFiles();
  const filesList = [];

  while (filesIter.hasNext() && filesList.length < 50) {
    const f = filesIter.next();
    const id = f.getId();
    filesList.push({
      id: id,
      name: f.getName(),
      url: `https://drive.google.com/thumbnail?id=${id}&sz=w1600`,
      thumbnail: `https://drive.google.com/thumbnail?id=${id}&sz=w600`,
      viewUrl: f.getUrl(),
      updatedAt: f.getLastUpdated().toISOString()
    });
  }

  return jsonResponse({
    ok: true,
    files: filesList
  });
}

/**
 * Helper: Send email via GmailApp with HTML body
 */
function sendEmail(recipient, subject, htmlBody) {
  const plainText = htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  GmailApp.sendEmail(recipient, subject, plainText, {
    htmlBody: htmlBody,
    name: 'Alex Rivera | Growth Advisory'
  });
}

/**
 * Helper: Retrieve or create target category folder in Google Drive
 */
function getCategoryFolder(subfolderName) {
  let rootFolder;
  const rootIter = DriveApp.getFoldersByName(ROOT_FOLDER_NAME);
  if (rootIter.hasNext()) {
    rootFolder = rootIter.next();
  } else {
    rootFolder = DriveApp.createFolder(ROOT_FOLDER_NAME);
  }

  const subIter = rootFolder.getFoldersByName(subfolderName);
  if (subIter.hasNext()) {
    return subIter.next();
  } else {
    return rootFolder.createFolder(subfolderName);
  }
}

/**
 * Helper: Retrieve or create central Google Sheet
 */
function getOrCreateSpreadsheet() {
  const fileName = 'Alex Rivera Portfolio Submissions';
  const files = DriveApp.getFilesByName(fileName);
  if (files.hasNext()) {
    const file = files.next();
    return SpreadsheetApp.openById(file.getId());
  }
  return SpreadsheetApp.create(fileName);
}

/**
 * Helper: Retrieve or create specific sheet with bold header row
 */
function getOrCreateSheet(spreadsheet, sheetName, headers) {
  let sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet) {
    sheet = spreadsheet.insertSheet(sheetName);
    if (headers && headers.length > 0) {
      sheet.appendRow(headers);
      sheet.getRange(1, 1, 1, headers.length).setFontWeight('bold');
      sheet.setFrozenRows(1);
    }
  }
  return sheet;
}

/**
 * Helper: Return JSON output with proper Content-Type
 */
function jsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Helper: Sanitize text for HTML injection safety
 */
function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
