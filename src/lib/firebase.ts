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
  console.log('[FIREBASE] Configuration:', {
    apiKey: firebaseConfig.apiKey !== "placeholder-key" ? '✓ Present' : '✗ Missing',
    authDomain: firebaseConfig.authDomain || '✗ Missing',
    projectId: firebaseConfig.projectId || '✗ Missing',
    appId: firebaseConfig.appId ? '✓ Present' : '✗ Missing',
    currentHost: window.location.hostname,
    protocol: window.location.protocol
  });

  // Critical: Check authorized domains for OAuth
  if (firebaseConfig.authDomain) {
    const currentHost = window.location.hostname;
    const isLocalhost = currentHost.includes('localhost') || currentHost.includes('127.0.0.1');

    if (!isLocalhost) {
      console.log('[FIREBASE] 🔐 OAuth Authorized Domains Check:');
      console.log('  Current domain:', currentHost);
      console.log('  Auth domain:', firebaseConfig.authDomain);
      console.log('  ⚠️  IMPORTANT: Ensure the following domains are added to Firebase Console:');
      console.log('     → Firebase Console → Authentication → Settings → Authorized domains');
      console.log('     Required domains:');
      console.log('       • buildathon.live');
      console.log('       • www.buildathon.live');
      console.log('       • ' + firebaseConfig.authDomain);
      console.log('  ');
      console.log('  Mobile OAuth requires these domains to be whitelisted or auth will fail!');
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
