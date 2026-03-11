#!/usr/bin/env tsx

/**
 * Migration script to transform single-tenant judge-app to multi-tenant SaaS
 *
 * This script:
 * 1. Creates a default "legacy" organization
 * 2. Migrates all existing events to the legacy organization
 * 3. Generates slugs for all events
 * 4. Denormalizes organizationId to teams, themes, and votes
 * 5. Adds eventId to votes for faster queries
 *
 * Usage: npm run migrate
 */

import * as admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import * as path from 'path';
import * as readline from 'readline';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '../.env.local') });

// Initialize Firebase Admin
if (!admin.apps.length) {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_KEY) {
    const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY);
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount),
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  } else {
    admin.initializeApp({
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    });
  }
}

const db = admin.firestore();

interface MigrationStats {
  organizationsCreated: number;
  eventsUpdated: number;
  teamsUpdated: number;
  themesUpdated: number;
  votesUpdated: number;
  errors: string[];
}

const stats: MigrationStats = {
  organizationsCreated: 0,
  eventsUpdated: 0,
  teamsUpdated: 0,
  themesUpdated: 0,
  votesUpdated: 0,
  errors: [],
};

/**
 * Create slug from event name
 */
function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100);
}

/**
 * Check if slug is unique within organization
 */
async function isSlugUnique(slug: string, orgId: string): Promise<boolean> {
  const eventsSnapshot = await db
    .collection('events')
    .where('organizationId', '==', orgId)
    .where('slug', '==', slug)
    .get();

  return eventsSnapshot.empty;
}

/**
 * Generate unique slug for event
 */
async function generateUniqueSlug(name: string, orgId: string): Promise<string> {
  let slug = createSlug(name);
  let counter = 2;

  while (!(await isSlugUnique(slug, orgId))) {
    slug = `${createSlug(name)}-${counter}`;
    counter++;

    if (counter > 100) {
      throw new Error(`Could not generate unique slug for: ${name}`);
    }
  }

  return slug;
}

/**
 * Prompt user for confirmation
 */
async function confirm(message: string): Promise<boolean> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${message} (yes/no): `, (answer) => {
      rl.close();
      resolve(answer.toLowerCase() === 'yes' || answer.toLowerCase() === 'y');
    });
  });
}

/**
 * Step 1: Create legacy organization
 */
async function createLegacyOrganization(): Promise<string> {
  console.log('\n[1/5] Creating legacy organization...');

  // Check if legacy org already exists
  const existingOrg = await db
    .collection('organizations')
    .where('slug', '==', 'legacy')
    .get();

  if (!existingOrg.empty) {
    console.log('✓ Legacy organization already exists');
    return existingOrg.docs[0].id;
  }

  const orgData = {
    name: 'Legacy Events',
    slug: 'legacy',
    description: 'Organization for migrated legacy events',
    logoUrl: '',
    websiteUrl: '',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
    memberCount: 0,
    settings: {
      allowPublicEventDiscovery: true,
    },
  };

  const orgRef = await db.collection('organizations').add(orgData);
  stats.organizationsCreated++;

  console.log(`✓ Created legacy organization: ${orgRef.id}`);
  return orgRef.id;
}

/**
 * Step 2: Migrate events
 */
async function migrateEvents(legacyOrgId: string): Promise<void> {
  console.log('\n[2/5] Migrating events...');

  const eventsSnapshot = await db.collection('events').get();

  if (eventsSnapshot.empty) {
    console.log('✓ No events to migrate');
    return;
  }

  console.log(`Found ${eventsSnapshot.size} events to migrate`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const eventDoc of eventsSnapshot.docs) {
    const eventData = eventDoc.data();

    // Skip if already migrated
    if (eventData.organizationId) {
      console.log(`  Skipping ${eventData.name} (already migrated)`);
      continue;
    }

    // Generate slug
    const slug = await generateUniqueSlug(eventData.name, legacyOrgId);

    // Update event
    batch.update(eventDoc.ref, {
      organizationId: legacyOrgId,
      slug: slug,
      visibility: 'public',
      createdBy: 'system',
      updatedAt: new Date().toISOString(),
    });

    batchCount++;
    stats.eventsUpdated++;

    console.log(`  ✓ ${eventData.name} -> ${slug}`);

    // Commit batch if we reach the limit
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batchCount = 0;
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✓ Migrated ${stats.eventsUpdated} events`);
}

/**
 * Step 3: Migrate teams
 */
async function migrateTeams(legacyOrgId: string): Promise<void> {
  console.log('\n[3/5] Migrating teams...');

  const teamsSnapshot = await db.collection('teams').get();

  if (teamsSnapshot.empty) {
    console.log('✓ No teams to migrate');
    return;
  }

  console.log(`Found ${teamsSnapshot.size} teams to migrate`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const teamDoc of teamsSnapshot.docs) {
    const teamData = teamDoc.data();

    // Skip if already migrated
    if (teamData.organizationId) {
      continue;
    }

    // Add organizationId
    batch.update(teamDoc.ref, {
      organizationId: legacyOrgId,
    });

    batchCount++;
    stats.teamsUpdated++;

    // Commit batch if we reach the limit
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batchCount = 0;
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✓ Migrated ${stats.teamsUpdated} teams`);
}

/**
 * Step 4: Migrate themes
 */
async function migrateThemes(legacyOrgId: string): Promise<void> {
  console.log('\n[4/5] Migrating themes...');

  const themesSnapshot = await db.collection('themes').get();

  if (themesSnapshot.empty) {
    console.log('✓ No themes to migrate');
    return;
  }

  console.log(`Found ${themesSnapshot.size} themes to migrate`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const themeDoc of themesSnapshot.docs) {
    const themeData = themeDoc.data();

    // Skip if already migrated
    if (themeData.organizationId) {
      continue;
    }

    // Add organizationId
    batch.update(themeDoc.ref, {
      organizationId: legacyOrgId,
    });

    batchCount++;
    stats.themesUpdated++;

    // Commit batch if we reach the limit
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batchCount = 0;
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✓ Migrated ${stats.themesUpdated} themes`);
}

/**
 * Step 5: Migrate votes
 */
async function migrateVotes(legacyOrgId: string): Promise<void> {
  console.log('\n[5/5] Migrating votes...');

  const votesSnapshot = await db.collection('votes').get();

  if (votesSnapshot.empty) {
    console.log('✓ No votes to migrate');
    return;
  }

  console.log(`Found ${votesSnapshot.size} votes to migrate`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const voteDoc of votesSnapshot.docs) {
    const voteData = voteDoc.data();

    // Skip if already migrated
    if (voteData.organizationId && voteData.eventId) {
      continue;
    }

    // Get team to find eventId
    const teamDoc = await db.collection('teams').doc(voteData.teamId).get();

    if (!teamDoc.exists) {
      stats.errors.push(`Vote ${voteDoc.id}: team ${voteData.teamId} not found`);
      continue;
    }

    const teamData = teamDoc.data();
    const eventId = teamData?.eventId;

    if (!eventId) {
      stats.errors.push(`Vote ${voteDoc.id}: team ${voteData.teamId} has no eventId`);
      continue;
    }

    // Add organizationId and eventId
    batch.update(voteDoc.ref, {
      organizationId: legacyOrgId,
      eventId: eventId,
    });

    batchCount++;
    stats.votesUpdated++;

    // Commit batch if we reach the limit
    if (batchCount >= BATCH_SIZE) {
      await batch.commit();
      batchCount = 0;
    }
  }

  // Commit remaining updates
  if (batchCount > 0) {
    await batch.commit();
  }

  console.log(`✓ Migrated ${stats.votesUpdated} votes`);
}

/**
 * Main migration function
 */
async function migrate() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Multi-Tenant Migration Script');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\nThis script will migrate your single-tenant judge-app to');
  console.log('a multi-tenant architecture.\n');

  // Check environment
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID not set');
    process.exit(1);
  }

  console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

  // Confirm before proceeding
  const shouldContinue = await confirm('\nDo you want to proceed with the migration?');

  if (!shouldContinue) {
    console.log('\n❌ Migration cancelled');
    process.exit(0);
  }

  const startTime = Date.now();

  try {
    // Step 1: Create legacy organization
    const legacyOrgId = await createLegacyOrganization();

    // Step 2: Migrate events
    await migrateEvents(legacyOrgId);

    // Step 3: Migrate teams
    await migrateTeams(legacyOrgId);

    // Step 4: Migrate themes
    await migrateThemes(legacyOrgId);

    // Step 5: Migrate votes
    await migrateVotes(legacyOrgId);

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  Migration Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nStatistics:`);
    console.log(`  Organizations created: ${stats.organizationsCreated}`);
    console.log(`  Events updated: ${stats.eventsUpdated}`);
    console.log(`  Teams updated: ${stats.teamsUpdated}`);
    console.log(`  Themes updated: ${stats.themesUpdated}`);
    console.log(`  Votes updated: ${stats.votesUpdated}`);
    console.log(`\nDuration: ${duration}s`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors (${stats.errors.length}):`);
      stats.errors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log('\n✓ Migration completed successfully!\n');
  } catch (error) {
    console.error('\n❌ Migration failed:', error);
    process.exit(1);
  }
}

// Run migration
migrate()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
