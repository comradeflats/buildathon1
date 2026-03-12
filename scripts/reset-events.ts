/**
 * Reset script: Removes all events, teams, themes, and votes
 * EXCEPT for "Reality Buildathon" and its related data.
 */

import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

// Helper to parse private key
function parsePrivateKey(key: string | undefined) {
  if (!key) return undefined;
  let parsedKey = key.replace(/\\n/g, '\n');
  parsedKey = parsedKey.trim();
  if (parsedKey.startsWith('"') && parsedKey.endsWith('"')) {
    parsedKey = parsedKey.substring(1, parsedKey.length - 1).trim();
  }
  return parsedKey;
}

// Initialize Firebase Admin
function initFirebaseAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = parsePrivateKey(process.env.FIREBASE_PRIVATE_KEY);

    if (!projectId || !clientEmail || !privateKey) {
      console.error('Missing Firebase Admin credentials');
      process.exit(1);
    }

    initializeApp({
      credential: cert({ projectId, clientEmail, privateKey }),
    });
  }
  return getFirestore();
}

async function reset() {
  const db = initFirebaseAdmin();
  console.log('🧹 Starting cleanup of past, current, and future events...');
  console.log('⚠️  Preserving "Reality Buildathon"');

  // 1. Find the Reality Buildathon event ID
  const eventsSnapshot = await db.collection('events').get();
  let realityBuildathonId: string | null = null;
  const eventsToDelete: string[] = [];

  eventsSnapshot.forEach(doc => {
    const data = doc.data();
    if (data.name === 'Reality Buildathon') {
      realityBuildathonId = doc.id;
      console.log(`📍 Found Reality Buildathon (ID: ${realityBuildathonId})`);
    } else {
      eventsToDelete.push(doc.id);
    }
  });

  if (!realityBuildathonId) {
    console.warn('❌ Could not find "Reality Buildathon" event. No events will be preserved.');
  }

  // 2. Delete other events
  console.log(`🗑️  Deleting ${eventsToDelete.length} other events...`);
  for (const id of eventsToDelete) {
    await db.collection('events').doc(id).delete();
  }

  // 3. Delete teams not belonging to Reality Buildathon
  const teamsSnapshot = await db.collection('teams').get();
  let teamsDeleted = 0;
  for (const doc of teamsSnapshot.docs) {
    const data = doc.data();
    if (data.eventId !== realityBuildathonId) {
      await db.collection('teams').doc(doc.id).delete();
      teamsDeleted++;
    }
  }
  console.log(`🗑️  Deleted ${teamsDeleted} teams.`);

  // 4. Delete themes not belonging to Reality Buildathon
  const themesSnapshot = await db.collection('themes').get();
  let themesDeleted = 0;
  for (const doc of themesSnapshot.docs) {
    const data = doc.data();
    if (data.eventId !== realityBuildathonId) {
      await db.collection('themes').doc(doc.id).delete();
      themesDeleted++;
    }
  }
  console.log(`🗑️  Deleted ${themesDeleted} themes.`);

  // 5. Delete votes not belonging to Reality Buildathon
  const votesSnapshot = await db.collection('votes').get();
  let votesDeleted = 0;
  for (const doc of votesSnapshot.docs) {
    const data = doc.data();
    if (data.eventId !== realityBuildathonId) {
      await db.collection('votes').doc(doc.id).delete();
      votesDeleted++;
    }
  }
  console.log(`🗑️  Deleted ${votesDeleted} votes.`);

  console.log('✅ Cleanup complete!');
}

reset().catch(console.error);
