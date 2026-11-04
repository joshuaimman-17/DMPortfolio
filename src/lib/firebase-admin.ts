import 'server-only';
import { getApps, initializeApp, cert, type App } from 'firebase-admin/app';
import { getFirestore, type Firestore } from 'firebase-admin/firestore';
import { getAuth, type Auth } from 'firebase-admin/auth';
import firebaseConfig from '../../firebase-applet-config.json';

function isValidPemKey(key: string | undefined): boolean {
  if (!key || typeof key !== 'string') return false;
  const trimmed = key.trim();
  // Reject obvious placeholder strings or truncated keys
  if (
    trimmed.includes('...') ||
    trimmed.includes('xxxxx') ||
    trimmed.includes('your-firebase-project') ||
    trimmed.length < 300
  ) {
    return false;
  }
  return trimmed.includes('BEGIN PRIVATE KEY') || trimmed.includes('BEGIN RSA PRIVATE KEY');
}

function formatPrivateKey(key: string): string {
  let cleaned = key.trim().replace(/^["']|["']$/g, '');
  if (cleaned.includes('\\n')) {
    cleaned = cleaned.replace(/\\n/g, '\n');
  }
  return cleaned;
}

function getAdminApp(): App {
  const apps = getApps();
  if (apps.length > 0 && apps[0]) {
    return apps[0];
  }

  const projectId = process.env.FIREBASE_PROJECT_ID || firebaseConfig.projectId;
  const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
  const rawKey = process.env.FIREBASE_PRIVATE_KEY;

  if (
    projectId &&
    !projectId.includes('your-firebase-project') &&
    clientEmail &&
    !clientEmail.includes('xxxxx') &&
    isValidPemKey(rawKey)
  ) {
    try {
      const privateKey = formatPrivateKey(rawKey!);
      return initializeApp({
        credential: cert({
          projectId,
          clientEmail,
          privateKey,
        }),
      });
    } catch (err) {
      console.warn('[firebase-admin] Notice: Service account cert init failed, using project fallback.');
    }
  }

  // Graceful fallback without cert (uses Application Default Credentials or projectId)
  return initializeApp({
    projectId: firebaseConfig.projectId,
  });
}

export function getAdminFirestore(): Firestore {
  const app = getAdminApp();
  const dbId = (firebaseConfig as any).firestoreDatabaseId;
  return dbId && dbId !== '(default)' ? getFirestore(app, dbId) : getFirestore(app);
}

export function getAdminAuth(): Auth {
  const app = getAdminApp();
  return getAuth(app);
}

