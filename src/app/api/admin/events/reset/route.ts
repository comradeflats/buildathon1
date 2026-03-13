import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

/**
 * POST /api/admin/events/reset
 * Resets an event to registration phase and clears all submissions/votes
 */
export async function POST(request: NextRequest) {
  try {
    const { eventId, adminSession } = await request.json();

    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    
    // 1. Get the event to verify it exists
    const eventRef = db.collection('events').doc(eventId);
    const eventDoc = await eventRef.get();
    
    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const batch = db.batch();

    // 2. Reset event status and phase
    batch.update(eventRef, {
      status: 'upcoming',
      phase: 'registration',
      isLive: false,
      isActive: false,
      isRegistrationOpen: true,
      updatedAt: new Date().toISOString(),
      // Clear timers if any
      timerEndTime: null,
      timerSecondsLeft: null,
      isTimerPaused: false
    });

    // 3. Clear associated teams (submissions)
    const teamsSnapshot = await db.collection('teams')
      .where('eventId', '==', eventId)
      .get();

    teamsSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 4. Clear associated votes
    const votesSnapshot = await db.collection('votes')
      .where('eventId', '==', eventId)
      .get();

    votesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // 5. Commit all changes
    await batch.commit();

    return NextResponse.json({ 
      success: true, 
      message: 'Event reset successfully. All submissions and votes cleared.' 
    });
  } catch (error) {
    console.error('Reset event error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to reset event' },
      { status: 500 }
    );
  }
}
