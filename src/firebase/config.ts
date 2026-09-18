import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

export interface FirebaseConfigOptions {
  apiKey?: string;
  authDomain?: string;
  projectId?: string;
  storageBucket?: string;
  messagingSenderId?: string;
  appId?: string;
  measurementId?: string;
  firestoreDatabaseId?: string;
}

// Default configuration provided for the hospital facility project
export const DEFAULT_FIREBASE_CONFIG: FirebaseConfigOptions = {
  apiKey: "AIzaSyDeF0pUbhb8sT5DvJ-SMrGhSBxlpZTip2g",
  authDomain: "followup-eae79.firebaseapp.com",
  projectId: "followup-eae79",
  storageBucket: "followup-eae79.firebasestorage.app",
  messagingSenderId: "805479643457",
  appId: "1:805479643457:web:97466525a8ad07a57409c0",
  measurementId: "G-EGYSMVTD0V"
};

export function getSavedFirebaseConfig(): FirebaseConfigOptions {
  // 1. Check Vite env variables if present
  if (import.meta.env.VITE_FIREBASE_API_KEY && import.meta.env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
      authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || `${import.meta.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: import.meta.env.VITE_FIREBASE_APP_ID,
      measurementId: import.meta.env.VITE_FIREBASE_MEASUREMENT_ID,
    };
  }

  // 2. Default operational project configuration
  return DEFAULT_FIREBASE_CONFIG;
}

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let isConfigured = false;

const config = getSavedFirebaseConfig();

if (config && config.apiKey && config.projectId) {
  try {
    app = getApps().length > 0 ? getApp() : initializeApp(config);
    auth = getAuth(app);
    db = config.firestoreDatabaseId ? getFirestore(app, config.firestoreDatabaseId) : getFirestore(app);
    isConfigured = true;

    // Safely check and initialize analytics in client environment
    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          try {
            analytics = getAnalytics(app);
          } catch (err) {
            // Analytics non-blocking
          }
        }
      });
    }
  } catch (e) {
    console.warn('Firebase initialization error, defaulting to local mode:', e);
    isConfigured = false;
  }
}

export { app, auth, db, analytics, isConfigured };

// Required skill error helper
export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null): never {
  const currentUser = auth?.currentUser;
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: currentUser?.uid,
      email: currentUser?.email,
      emailVerified: currentUser?.emailVerified,
      isAnonymous: currentUser?.isAnonymous,
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}
