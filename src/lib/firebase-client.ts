'use client';

// Re-export configured Firebase instances from ./firebase to ensure single-instance initialization
// with long-polling and stream idle timeout suppression.
export {
  app,
  auth,
  db,
  storage,
  googleProvider,
  testFirestoreConnection,
  getAccessToken,
  setCachedAccessToken,
} from './firebase';
