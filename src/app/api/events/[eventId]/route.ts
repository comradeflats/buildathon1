import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { requireOrgAdmin, handleAuthError } from '@/lib/auth-helpers';

/**
 * GET /api/events/[eventId]
 * Fetch a single event by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const db = getFirestoreAdmin();
    const eventDoc = await db.collection('events').doc(params.eventId).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = {
      id: eventDoc.id,
      ...eventDoc.data(),
    };

    return NextResponse.json({
      event: eventData
    });
  } catch (error) {
    console.error('Error fetching event:', error);
    return NextResponse.json(
      { error: 'Failed to fetch event' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/events/[eventId]
 * Update an existing event (requires org admin authentication)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const db = getFirestoreAdmin();

    // Get the event to verify ownership
    const eventDoc = await db.collection('events').doc(params.eventId).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = eventDoc.data();
    if (!eventData) {
      return NextResponse.json(
        { error: 'Event data not found' },
        { status: 404 }
      );
    }

    // Verify user is org admin
    await requireOrgAdmin(request, eventData.organizationId);

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, organizationId, createdAt, createdBy, slug, ...updates } = body;

    // Update event
    await db.collection('events').doc(params.eventId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * DELETE /api/events/[eventId]
 * Delete an event (requires org admin authentication)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const db = getFirestoreAdmin();

    // Get the event to verify ownership
    const eventDoc = await db.collection('events').doc(params.eventId).get();

    if (!eventDoc.exists) {
      return NextResponse.json(
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    const eventData = eventDoc.data();
    if (!eventData) {
      return NextResponse.json(
        { error: 'Event data not found' },
        { status: 404 }
      );
    }

    // Verify user is org admin
    await requireOrgAdmin(request, eventData.organizationId);

    // Delete event (cascade deletion of teams, themes, votes would be handled separately)
    await db.collection('events').doc(params.eventId).delete();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
