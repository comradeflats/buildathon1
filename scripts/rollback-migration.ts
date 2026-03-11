#!/usr/bin/env tsx

/**
 * Rollback script to revert multi-tenant migration
 *
 * This script removes multi-tenant fields added during migration:
 * - Removes organizationId, slug, visibility, createdBy from events
 * - Removes organizationId from teams, themes, votes
 * - Removes eventId from votes
 * - Does NOT delete organizations or orgMembers (manual cleanup required)
 *
 * Usage: npm run rollback
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

interface RollbackStats {
  eventsReverted: number;
  teamsReverted: number;
  themesReverted: number;
  votesReverted: number;
  errors: string[];
}

const stats: RollbackStats = {
  eventsReverted: 0,
  teamsReverted: 0,
  themesReverted: 0,
  votesReverted: 0,
  errors: [],
};

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
 * Rollback events
 */
async function rollbackEvents(): Promise<void> {
  console.log('\n[1/4] Rolling back events...');

  const eventsSnapshot = await db.collection('events').get();

  if (eventsSnapshot.empty) {
    console.log('✓ No events to rollback');
    return;
  }

  console.log(`Found ${eventsSnapshot.size} events to rollback`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const eventDoc of eventsSnapshot.docs) {
    // Remove multi-tenant fields
    batch.update(eventDoc.ref, {
      organizationId: admin.firestore.FieldValue.delete(),
      slug: admin.firestore.FieldValue.delete(),
      visibility: admin.firestore.FieldValue.delete(),
      createdBy: admin.firestore.FieldValue.delete(),
      updatedAt: admin.firestore.FieldValue.delete(),
    });

    batchCount++;
    stats.eventsReverted++;

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

  console.log(`✓ Reverted ${stats.eventsReverted} events`);
}

/**
 * Rollback teams
 */
async function rollbackTeams(): Promise<void> {
  console.log('\n[2/4] Rolling back teams...');

  const teamsSnapshot = await db.collection('teams').get();

  if (teamsSnapshot.empty) {
    console.log('✓ No teams to rollback');
    return;
  }

  console.log(`Found ${teamsSnapshot.size} teams to rollback`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const teamDoc of teamsSnapshot.docs) {
    // Remove organizationId
    batch.update(teamDoc.ref, {
      organizationId: admin.firestore.FieldValue.delete(),
    });

    batchCount++;
    stats.teamsReverted++;

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

  console.log(`✓ Reverted ${stats.teamsReverted} teams`);
}

/**
 * Rollback themes
 */
async function rollbackThemes(): Promise<void> {
  console.log('\n[3/4] Rolling back themes...');

  const themesSnapshot = await db.collection('themes').get();

  if (themesSnapshot.empty) {
    console.log('✓ No themes to rollback');
    return;
  }

  console.log(`Found ${themesSnapshot.size} themes to rollback`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const themeDoc of themesSnapshot.docs) {
    // Remove organizationId
    batch.update(themeDoc.ref, {
      organizationId: admin.firestore.FieldValue.delete(),
    });

    batchCount++;
    stats.themesReverted++;

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

  console.log(`✓ Reverted ${stats.themesReverted} themes`);
}

/**
 * Rollback votes
 */
async function rollbackVotes(): Promise<void> {
  console.log('\n[4/4] Rolling back votes...');

  const votesSnapshot = await db.collection('votes').get();

  if (votesSnapshot.empty) {
    console.log('✓ No votes to rollback');
    return;
  }

  console.log(`Found ${votesSnapshot.size} votes to rollback`);

  const batch = db.batch();
  let batchCount = 0;
  const BATCH_SIZE = 500;

  for (const voteDoc of votesSnapshot.docs) {
    // Remove organizationId and eventId
    batch.update(voteDoc.ref, {
      organizationId: admin.firestore.FieldValue.delete(),
      eventId: admin.firestore.FieldValue.delete(),
    });

    batchCount++;
    stats.votesReverted++;

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

  console.log(`✓ Reverted ${stats.votesReverted} votes`);
}

/**
 * Main rollback function
 */
async function rollback() {
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  Multi-Tenant Rollback Script');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('\n⚠️  WARNING: This will remove multi-tenant fields from all');
  console.log('documents in your database.\n');
  console.log('Organizations and org members will NOT be deleted.');
  console.log('You must manually clean them up if needed.\n');

  // Check environment
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) {
    console.error('❌ Error: NEXT_PUBLIC_FIREBASE_PROJECT_ID not set');
    process.exit(1);
  }

  console.log(`Project ID: ${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}`);

  // Confirm before proceeding
  const shouldContinue = await confirm('\nDo you want to proceed with the rollback?');

  if (!shouldContinue) {
    console.log('\n❌ Rollback cancelled');
    process.exit(0);
  }

  const startTime = Date.now();

  try {
    // Step 1: Rollback events
    await rollbackEvents();

    // Step 2: Rollback teams
    await rollbackTeams();

    // Step 3: Rollback themes
    await rollbackThemes();

    // Step 4: Rollback votes
    await rollbackVotes();

    const duration = ((Date.now() - startTime) / 1000).toFixed(2);

    console.log('\n═══════════════════════════════════════════════════════════');
    console.log('  Rollback Complete!');
    console.log('═══════════════════════════════════════════════════════════');
    console.log(`\nStatistics:`);
    console.log(`  Events reverted: ${stats.eventsReverted}`);
    console.log(`  Teams reverted: ${stats.teamsReverted}`);
    console.log(`  Themes reverted: ${stats.themesReverted}`);
    console.log(`  Votes reverted: ${stats.votesReverted}`);
    console.log(`\nDuration: ${duration}s`);

    if (stats.errors.length > 0) {
      console.log(`\n⚠️  Errors (${stats.errors.length}):`);
      stats.errors.forEach((error) => console.log(`  - ${error}`));
    }

    console.log('\n✓ Rollback completed successfully!\n');
    console.log('⚠️  Remember to manually delete organizations and orgMembers');
    console.log('collections if you no longer need them.\n');
  } catch (error) {
    console.error('\n❌ Rollback failed:', error);
    process.exit(1);
  }
}

// Run rollback
rollback()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Unhandled error:', error);
    process.exit(1);
  });
