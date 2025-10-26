import { getApp, getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const PLACEHOLDER_TOKEN = 'YOUR_FIREBASE_';

export function hasValidFirebaseConfig() {
  return Object.values(firebaseConfig).every((value) => {
    if (typeof value !== 'string') return false;
    if (!value.length) return false;
    return !value.includes(PLACEHOLDER_TOKEN);
  });
}

export function getFirebaseApp() {
  if (!hasValidFirebaseConfig()) {
    throw new Error('Firebase config inválida.');
  }

  if (getApps().length) {
    return getApp();
  }

  return initializeApp(firebaseConfig);
}

export function getFirebaseDatabase() {
  return getDatabase(getFirebaseApp());
}

export { firebaseConfig };
