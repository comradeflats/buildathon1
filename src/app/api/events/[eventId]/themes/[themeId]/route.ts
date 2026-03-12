import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firestore-admin';
import { requireOrgAdmin, handleAuthError } from '@/lib/auth-helpers';

/**
 * PUT /api/events/[eventId]/themes/[themeId]
 * Update an existing theme
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string, themeId: string } }
) {
  try {
    const body = await request.json();
    const { organizationId, ...updates } = body;

    // Verify user is org admin
    await requireOrgAdmin(request, organizationId);

    const db = getFirestoreAdmin();
    const themeRef = db.collection('themes').doc(params.themeId);
    
    // Clean up updates to avoid overwriting IDs
    const { id, eventId, createdAt, ...cleanUpdates } = updates;

    await themeRef.update({
      ...cleanUpdates,
      updatedAt: new Date().toISOString()
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * DELETE /api/events/[eventId]/themes/[themeId]
 * Delete a theme
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string, themeId: string } }
) {
  try {
    const { organizationId } = await request.json();

    // Verify user is org admin
    await requireOrgAdmin(request, organizationId);

    const db = getFirestoreAdmin();
    await db.collection('themes').doc(params.themeId).delete();

    // Check if themes still exist for event and update flag
    const themesSnapshot = await db.collection('themes').where('eventId', '==', params.eventId).get();
    if (themesSnapshot.empty) {
      await db.collection('events').doc(params.eventId).update({ themesGenerated: false });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
