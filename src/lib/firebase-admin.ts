import * as admin from 'firebase-admin';

let app: admin.app.App;

// Initialize Firebase Admin SDK
export function getFirebaseAdmin() {
  if (app) {
    return app;
  }

  // Check if already initialized
  if (admin.apps.length > 0) {
    app = admin.apps[0]!;
    return app;
  }

  // Initialize with service account or application default credentials
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    // Use service account key from environment variable
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);

    app = admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else if (process.env.FIREBASE_CLIENT_EMAIL && process.env.FIREBASE_PRIVATE_KEY) {
    // Use separate environment variables (preferred in this project)
    const privateKey = process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n').trim();
    
    app = admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: privateKey.startsWith('"') && privateKey.endsWith('"') 
          ? privateKey.substring(1, privateKey.length - 1) 
          : privateKey,
      }),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else if (process.env.GOOGLE_APPLICATION_CREDENTIALS) {
    // Use application default credentials (for deployed environments)
    app = admin.initializeApp({
      credential: admin.credential.applicationDefault(),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    // Fallback: initialize without credentials for local development
    // This will work for Firestore emulator
    app = admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }

  return app;
}

export function getFirestoreAdmin() {
  const app = getFirebaseAdmin();
  return app.firestore();
}

export function getAuthAdmin() {
  const app = getFirebaseAdmin();
  return app.auth();
}
