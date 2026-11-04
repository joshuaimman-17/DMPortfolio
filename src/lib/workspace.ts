/**
 * Google Workspace Helper Library
 * Provides direct Google Sheets & Gmail API integrations using OAuth access tokens.
 */

export interface EmailPayload {
  to: string;
  subject: string;
  htmlBody: string;
  fromName?: string;
}

/**
 * Encodes an email into RFC 2822 standard format and encodes to base64url
 */
export function createRfc2822Message({
  to,
  subject,
  htmlBody,
  fromName = 'Alex Rivera | Growth Advisory',
}: EmailPayload): string {
  const plainText = htmlBody.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
  const boundary = `__boundary_${Date.now()}__`;

  const messageParts = [
    `To: ${to}`,
    `Subject: =?utf-8?B?${Buffer.from(subject).toString('base64')}?=`,
    `MIME-Version: 1.0`,
    `Content-Type: multipart/alternative; boundary="${boundary}"`,
    '',
    `--${boundary}`,
    'Content-Type: text/plain; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    plainText,
    '',
    `--${boundary}`,
    'Content-Type: text/html; charset=UTF-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    htmlBody,
    '',
    `--${boundary}--`,
  ];

  const rawMessage = messageParts.join('\r\n');
  return Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

/**
 * Sends an email using the Gmail REST API (users.messages.send)
 */
export async function sendGmail(
  accessToken: string,
  emailData: EmailPayload
): Promise<{ success: boolean; id?: string; error?: string }> {
  try {
    const raw = createRfc2822Message(emailData);
    const res = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ raw }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err?.error?.message || `Gmail API HTTP ${res.status}` };
    }

    const data = await res.json();
    return { success: true, id: data.id };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to send email via Gmail' };
  }
}

/**
 * Appends a row to a Google Spreadsheet using the Google Sheets REST API
 */
export async function appendSpreadsheetRow(
  accessToken: string,
  spreadsheetId: string,
  range: string,
  rowValues: any[]
): Promise<{ success: boolean; updatedRange?: string; error?: string }> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(range)}:append?valueInputOption=USER_ENTERED`;

    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        values: [rowValues],
      }),
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err?.error?.message || `Google Sheets API HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return {
      success: true,
      updatedRange: data?.updates?.updatedRange,
    };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to append row to Google Sheets' };
  }
}

/**
 * Fetches values from a Google Spreadsheet range
 */
export async function getSpreadsheetValues(
  accessToken: string,
  spreadsheetId: string,
  range: string
): Promise<{ success: boolean; values?: any[][]; error?: string }> {
  try {
    const url = `https://sheets.googleapis.com/v4/spreadsheets/${encodeURIComponent(
      spreadsheetId
    )}/values/${encodeURIComponent(range)}`;

    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({}));
      return {
        success: false,
        error: err?.error?.message || `Google Sheets API HTTP ${res.status}`,
      };
    }

    const data = await res.json();
    return { success: true, values: data.values || [] };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to fetch Google Sheets values' };
  }
}
