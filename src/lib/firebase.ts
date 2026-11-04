'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, setPersistence, browserLocalPersistence } from 'firebase/auth';
import {
  getFirestore,
  initializeFirestore,
  doc,
  getDocFromServer,
  setLogLevel,
  type Firestore,
} from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfig from '../../firebase-applet-config.json';

// Suppress benign gRPC idle stream disconnection notices
try {
  setLogLevel('silent');
} catch {
  // Ignore in environments where log level was previously assigned
}

// Initialize Firebase App
export const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Authentication
export const auth = getAuth(app);
// Ensure persistence across refreshes
if (typeof window !== 'undefined') {
  setPersistence(auth, browserLocalPersistence).catch(() => {});
}

// In-memory cache for OAuth access token
let cachedAccessToken: string | null = null;
export const getAccessToken = async (): Promise<string | null> => {
  return cachedAccessToken;
};
export const setCachedAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

// Google Auth Provider with Google Workspace Scopes
export const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });
googleProvider.addScope('https://www.googleapis.com/auth/spreadsheets');
googleProvider.addScope('https://www.googleapis.com/auth/gmail.send');
googleProvider.addScope('https://www.googleapis.com/auth/drive.file');

const config = firebaseConfig as any;
const customDbId =
  config.firestoreDatabaseId && config.firestoreDatabaseId !== '(default)'
    ? config.firestoreDatabaseId
    : undefined;

// Configure Firestore with long polling to prevent idle gRPC stream timeouts on Cloud Run/proxies
export const db: Firestore = (() => {
  try {
    return customDbId
      ? initializeFirestore(
          app,
          {
            experimentalAutoDetectLongPolling: true,
            ignoreUndefinedProperties: true,
          },
          customDbId
        )
      : initializeFirestore(app, {
          experimentalAutoDetectLongPolling: true,
          ignoreUndefinedProperties: true,
        });
  } catch {
    return customDbId ? getFirestore(app, customDbId) : getFirestore(app);
  }
})();

// Storage
export const storage = getStorage(app);

// Test connection without throwing uncaught errors
export async function testFirestoreConnection(): Promise<boolean> {
  try {
    await getDocFromServer(doc(db, 'settings', 'hero'));
    return true;
  } catch {
    return false;
  }
}
