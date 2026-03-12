import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { getFirestoreAdmin } from '@/lib/firestore-admin';
import { requireOrgAdmin, handleAuthError } from '@/lib/auth-helpers';

/**
 * GET /api/events/[eventId]/themes
 * Fetch all themes for a specific event
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const db = getFirestoreAdmin();
    const themesSnapshot = await db.collection('themes')
      .where('eventId', '==', params.eventId)
      .orderBy('createdAt', 'desc')
      .get();

    const themes = themesSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return NextResponse.json({ themes });
  } catch (error) {
    console.error('Error fetching themes:', error);
    return NextResponse.json(
      { error: 'Failed to fetch themes' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events/[eventId]/themes
 * Create a new manual theme
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const body = await request.json();
    const { name, emoji, iconKey, concept, judgingCriteria, organizationId, isPublished } = body;

    // Verify user is org admin
    await requireOrgAdmin(request, organizationId);

    const db = getFirestoreAdmin();
    const themeId = uuidv4();
    
    const themeData = {
      id: themeId,
      name,
      emoji,
      iconKey: iconKey || 'sparkles',
      concept,
      judgingCriteria: judgingCriteria || [],
      eventId: params.eventId,
      organizationId,
      isPublished: isPublished || false,
      createdAt: new Date().toISOString(),
    };

    await db.collection('themes').doc(themeId).set(themeData);

    // Update event themesGenerated status if this is the first theme
    const themesCount = (await db.collection('themes').where('eventId', '==', params.eventId).get()).size;
    if (themesCount === 1) {
      await db.collection('events').doc(params.eventId).update({ themesGenerated: true });
    }

    return NextResponse.json({ success: true, theme: themeData });
  } catch (error) {
    return handleAuthError(error);
  }
}
