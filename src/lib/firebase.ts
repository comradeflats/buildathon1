import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase only if we have a valid config or if we are in the browser
// This prevents build-time errors when env vars are missing
const app = (typeof window !== 'undefined' || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) 
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

const db = app ? getFirestore(app) : null as any;
const auth = app ? getAuth(app) : null as any;

export { app, db, auth };
