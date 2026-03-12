/**
 * Seed script for regional buildathon events
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

const REGIONAL_EVENTS = [
  {
    id: 'danang-build-1',
    name: 'Da Nang Buildathon #1',
    description: 'The one that started it all. Focus on local impact.',
    location: 'Da Nang, Vietnam',
    coordinates: { lat: 16.0544, lng: 108.2022 },
    status: 'archived',
    isActive: false,
    startDate: '2024-01-15',
    endDate: '2024-01-15',
    isMockData: true
  },
  {
    id: 'hcmc-sprint',
    name: 'Saigon Tech Sprint',
    description: 'High energy building in the heart of HCMC.',
    location: 'Ho Chi Minh City, Vietnam',
    coordinates: { lat: 10.7769, lng: 106.7009 },
    status: 'active',
    isActive: true,
    startDate: '2024-03-10',
    endDate: '2024-03-12',
    isMockData: true
  },
  {
    id: 'singapore-global',
    name: 'Singapore Global Build',
    description: 'International teams competing for global prizes.',
    location: 'Singapore',
    coordinates: { lat: 1.3521, lng: 103.8198 },
    status: 'upcoming',
    isActive: true,
    startDate: '2024-04-20',
    endDate: '2024-04-21',
    isMockData: true
  },
  {
    id: 'bangkok-node',
    name: 'Bangkok Builders Node',
    description: 'A community-led buildathon focusing on Web3.',
    location: 'Bangkok, Thailand',
    coordinates: { lat: 13.7563, lng: 100.5018 },
    status: 'upcoming',
    isActive: true,
    startDate: '2024-05-05',
    endDate: '2024-05-05',
    isMockData: true
  },
  {
    id: 'tokyo-neon',
    name: 'Tokyo Neon Build',
    description: 'Designing the future in the city of the future.',
    location: 'Tokyo, Japan',
    coordinates: { lat: 35.6762, lng: 139.6503 },
    status: 'archived',
    isActive: false,
    startDate: '2023-11-12',
    endDate: '2023-11-13',
    isMockData: true
  }
];

async function seed() {
  const db = initFirebaseAdmin();
  console.log('🌱 Seeding regional events...');

  for (const event of REGIONAL_EVENTS) {
    const now = new Date().toISOString();
    await db.collection('events').doc(event.id).set({
      ...event,
      createdAt: now,
      updatedAt: now,
      slug: event.id,
      organizationId: 'org-global',
      themesGenerated: true
    });
    console.log(`   Created: ${event.name} in ${event.location}`);
  }

  console.log('✅ Done!');
}

seed().catch(console.error);
