import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Helper to parse private key
function parsePrivateKey(key: string | undefined) {
  if (!key) return undefined;
  
  // Handle double-escaped newlines and literal newlines
  let parsedKey = key.replace(/\\n/g, '\n');
  
  // Trim potential surrounding whitespace and quotes
  parsedKey = parsedKey.trim();
  if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
    parsedKey = parsedKey.substring(1, parsedKey.length - 1).trim();
  }
  
  return parsedKey;
}

// Initialize Firebase Admin SDK
export function getFirestoreAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials (ProjectId, Email, or Key)');
    }

    initializeApp({
      credential: cert({
        projectId,
        clientEmail,
        privateKey,
      }),
    });
  }
  return getFirestore();
}
