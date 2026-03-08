import { NextRequest, NextResponse } from 'next/server';
import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';

// Initialize Firebase Admin SDK
function getFirestoreAdmin() {
  if (getApps().length === 0) {
    const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n');

    if (!projectId || !clientEmail || !privateKey) {
      throw new Error('Missing Firebase Admin credentials');
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

// Create a new event
export async function POST(request: NextRequest) {
  try {
    const { event, adminSession } = await request.json();

    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!event || !event.id || !event.name) {
      return NextResponse.json(
        { error: 'Event ID and name are required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const eventDoc = {
      ...event,
      createdAt: new Date().toISOString(),
      themesGenerated: false,
    };

    await db.collection('events').doc(event.id).set(eventDoc);

    return NextResponse.json({ success: true, event: eventDoc });
  } catch (error) {
    console.error('Create event error:', error);
    return NextResponse.json(
      { error: 'Failed to create event' },
      { status: 500 }
    );
  }
}

// Update an event
export async function PUT(request: NextRequest) {
  try {
    const { event, adminSession } = await request.json();

    if (adminSession !== 'authenticated') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    if (!event || !event.id) {
      return NextResponse.json(
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();
    const { id, ...updateData } = event;
    await db.collection('events').doc(id).update(updateData);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Update event error:', error);
    return NextResponse.json(
      { error: 'Failed to update event' },
      { status: 500 }
    );
  }
}

// Delete an event
export async function DELETE(request: NextRequest) {
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

    // Delete associated themes
    const themesSnapshot = await db.collection('themes')
      .where('eventId', '==', eventId)
      .get();

    const batch = db.batch();
    themesSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete the event
    batch.delete(db.collection('events').doc(eventId));

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Delete event error:', error);
    return NextResponse.json(
      { error: 'Failed to delete event' },
      { status: 500 }
    );
  }
}
