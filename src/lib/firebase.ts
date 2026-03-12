import { initializeApp, getApps, getApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth, GithubAuthProvider, GoogleAuthProvider, EmailAuthProvider } from "firebase/auth";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || "placeholder-key",
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Debug config availability on client
if (typeof window !== 'undefined') {
  console.log('[FIREBASE] Config present:', {
    apiKey: firebaseConfig.apiKey !== "placeholder-key",
    authDomain: firebaseConfig.authDomain,
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    currentHost: window.location.hostname
  });
  
  // Warning for common mobile auth failure cause
  if (firebaseConfig.authDomain && !window.location.hostname.includes(firebaseConfig.authDomain.split('.')[0])) {
    if (!window.location.hostname.includes('localhost') && !window.location.hostname.includes('127.0.0.1')) {
      console.warn('[FIREBASE] AUTH DOMAIN MISMATCH: Your authDomain does not match your current host. ' +
        'Mobile redirects will likely fail due to browser security policies (ITP). ' +
        'Fix: Use a custom auth domain (e.g., auth.buildathon.live) in Firebase Console.');
    }
  }
}

// Initialize Firebase only if we have a valid config or if we are in the browser
// This prevents build-time errors when env vars are missing
const app = (typeof window !== 'undefined' || process.env.NEXT_PUBLIC_FIREBASE_API_KEY) 
  ? (getApps().length > 0 ? getApp() : initializeApp(firebaseConfig))
  : null;

const db = app ? getFirestore(app) : null as any;
const auth = app ? getAuth(app) : null as any;
const githubProvider = app ? new GithubAuthProvider() : null as any;
const googleProvider = app ? new GoogleAuthProvider() : null as any;
const emailProvider = EmailAuthProvider;

export { app, db, auth, githubProvider, googleProvider, emailProvider };
