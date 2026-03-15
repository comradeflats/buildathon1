import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { verifyFirebaseToken, handleAuthError } from '@/lib/auth-helpers';

/**
 * POST /api/user/migrate-guest-data
 * Migrate guest user data (registrations, submissions, votes) to authenticated account
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    const body = await request.json();
    const { guestUid, ownershipToken } = body;

    if (!guestUid) {
      return NextResponse.json(
        { error: 'Guest UID is required' },
        { status: 400 }
      );
    }

    if (!ownershipToken) {
      return NextResponse.json(
        { error: 'Ownership token is required for verification' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();

    // Track migration summary
    let migratedRegistrations = 0;
    let migratedSubmissions = 0;
    let migratedVotes = 0;

    // Run migration in a transaction to ensure consistency
    await db.runTransaction(async (transaction) => {
      // 1. Migrate Registrations
      const registrationsQuery = db
        .collection('registrations')
        .where('userId', '==', guestUid);

      const registrationsSnapshot = await transaction.get(registrationsQuery);

      registrationsSnapshot.docs.forEach(doc => {
        transaction.update(doc.ref, {
          userId: user.uid,
          updatedAt: new Date().toISOString(),
          migratedFrom: guestUid,
          migratedAt: new Date().toISOString()
        });
        migratedRegistrations++;
      });

      // 2. Migrate Teams (Submissions)
      const teamsQuery = db
        .collection('teams')
        .where('ownerId', '==', guestUid)
        .where('ownershipToken', '==', ownershipToken);

      const teamsSnapshot = await transaction.get(teamsQuery);

      teamsSnapshot.docs.forEach(doc => {
        transaction.update(doc.ref, {
          ownerId: user.uid,
          updatedAt: new Date().toISOString(),
          migratedFrom: guestUid,
          migratedAt: new Date().toISOString()
        });
        migratedSubmissions++;
      });

      // 3. Migrate Votes
      const votesQuery = db
        .collection('votes')
        .where('judgeId', '==', guestUid);

      const votesSnapshot = await transaction.get(votesQuery);

      votesSnapshot.docs.forEach(doc => {
        transaction.update(doc.ref, {
          judgeId: user.uid,
          migratedFrom: guestUid,
          migratedAt: new Date().toISOString()
        });
        migratedVotes++;
      });
    });

    return NextResponse.json({
      success: true,
      message: 'Guest data migrated successfully',
      summary: {
        registrations: migratedRegistrations,
        submissions: migratedSubmissions,
        votes: migratedVotes
      }
    });
  } catch (error: any) {
    console.error('[MIGRATION ERROR]', error);
    return handleAuthError(error);
  }
}
