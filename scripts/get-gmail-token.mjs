// One-time helper: obtains a Gmail refresh token for the sender account.
//
// Prereqs (Google Cloud Console, same project as Firebase):
//   1. APIs & Services > Library: Gmail API is enabled.
//   2. APIs & Services > OAuth consent screen: add the sender Gmail as a Test user
//      (or publish the app to "In production" — in "Testing" mode refresh tokens expire after 7 days).
//   3. APIs & Services > Credentials > Create credentials > OAuth client ID > "Desktop app".
//
// Usage:
//   node scripts/get-gmail-token.mjs <CLIENT_ID> <CLIENT_SECRET>
// (or set GOOGLE_OAUTH_CLIENT_ID / GOOGLE_OAUTH_CLIENT_SECRET in the environment)
//
// Sign in as the SENDER account (premmohan0147@gmail.com) when the browser opens,
// then copy the printed GMAIL_REFRESH_TOKEN into .env.local and your Vercel env vars.

import http from 'node:http';
import { exec } from 'node:child_process';

const clientId = process.argv[2] || process.env.GOOGLE_OAUTH_CLIENT_ID;
const clientSecret = process.argv[3] || process.env.GOOGLE_OAUTH_CLIENT_SECRET;
if (!clientId || !clientSecret) {
  console.error('Usage: node scripts/get-gmail-token.mjs <CLIENT_ID> <CLIENT_SECRET>');
  process.exit(1);
}

const PORT = 53682;
const redirectUri = `http://localhost:${PORT}`;
const scope = 'https://www.googleapis.com/auth/gmail.send';

const authUrl =
  'https://accounts.google.com/o/oauth2/v2/auth?' +
  new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope,
    access_type: 'offline',
    prompt: 'consent',
  }).toString();

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, redirectUri);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');
  if (!code && !error) {
    res.writeHead(404).end();
    return;
  }
  if (error) {
    res.writeHead(400, { 'Content-Type': 'text/plain' }).end(`Authorization failed: ${error}`);
    console.error('Authorization failed:', error);
    server.close();
    process.exit(1);
  }

  try {
    const tokenRes = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code,
        client_id: clientId,
        client_secret: clientSecret,
        redirect_uri: redirectUri,
        grant_type: 'authorization_code',
      }),
    });
    const data = await tokenRes.json();
    if (!tokenRes.ok || !data.refresh_token) {
      throw new Error(data.error_description || data.error || 'No refresh_token returned (revoke access at myaccount.google.com/permissions and retry).');
    }
    res.writeHead(200, { 'Content-Type': 'text/plain' }).end('Done! You can close this tab and return to the terminal.');
    console.log('\nAdd these to .env.local and your Vercel environment variables:\n');
    console.log(`GOOGLE_OAUTH_CLIENT_ID=${clientId}`);
    console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${clientSecret}`);
    console.log(`GMAIL_REFRESH_TOKEN=${data.refresh_token}\n`);
  } catch (e) {
    res.writeHead(500, { 'Content-Type': 'text/plain' }).end('Token exchange failed. See terminal.');
    console.error('Token exchange failed:', e.message);
  } finally {
    server.close();
  }
});

server.listen(PORT, () => {
  console.log('Opening browser to authorize Gmail sending...\nIf it does not open, visit:\n' + authUrl + '\n');
  const opener = process.platform === 'win32' ? `start "" "${authUrl}"` : process.platform === 'darwin' ? `open "${authUrl}"` : `xdg-open "${authUrl}"`;
  exec(opener);
});
