import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';

export const runtime = 'nodejs';

const NEW_JUDGING_CRITERIA = [
  "Creative Interpretation: How unique was the approach to the theme?",
  "Visual Design: Is the interface visually appealing and polished?",
  "Usability: Is the app intuitive and easy to use?",
  "Utility Impact: Does the app solve the core problem effectively?",
  "The 'Ship' Factor: How complete and polished is the prototype for a 1-hour build?"
];

export async function POST(request: NextRequest) {
  try {
    const { eventId, adminSession } = await request.json();

    if (!eventId) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    // Verify admin session
    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const db = getFirestoreAdmin();

    // Query all themes for this event
    const themesSnapshot = await db.collection('themes')
      .where('eventId', '==', eventId)
      .get();

    if (themesSnapshot.empty) {
      return NextResponse.json(
        { error: 'No themes found for this event' },
        { status: 404 }
      );
    }

    // Update each theme's judgingCriteria using a batch
    const batch = db.batch();
    const updatedThemeIds: string[] = [];

    themesSnapshot.forEach(doc => {
      batch.update(doc.ref, { judgingCriteria: NEW_JUDGING_CRITERIA });
      updatedThemeIds.push(doc.id);
    });

    await batch.commit();

    return NextResponse.json({
      success: true,
      message: `Updated judging criteria for ${updatedThemeIds.length} themes`,
      updatedThemeIds,
      newCriteria: NEW_JUDGING_CRITERIA,
    });
  } catch (error) {
    console.error('Update criteria error:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update criteria' },
      { status: 500 }
    );
  }
}
