import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { verifyFirebaseToken, requireOrgAdmin, handleAuthError } from '@/lib/auth-helpers';
import { generateEventSlug, validateSlug } from '@/lib/slugs';
import { generateSubmissionCode } from '@/lib/utils';

/**
 * GET /api/events
 * Fetch all public events or org-specific events
 */
export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(request.url);
    const orgId = searchParams.get('orgId');
    const status = searchParams.get('status');

    let query = db.collection('events');

    // Filter by organization if provided
    if (orgId) {
      query = query.where('organizationId', '==', orgId) as any;
    }

    // Filter by status if provided
    if (status) {
      query = query.where('status', '==', status) as any;
    }

    // Order by creation date
    query = query.orderBy('createdAt', 'desc') as any;

    const snapshot = await query.get();

    const events = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ events });
  } catch (error) {
    console.error('Error fetching events:', error);
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/events
 * Create a new event (requires org admin authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { 
      organizationId, 
      name, 
      description, 
      location, 
      address, 
      coordinates, 
      status, 
      startDate, 
      endDate, 
      submissionDeadline, 
      keyboardsDownTime, 
      votingModel,
      visibility, 
      slug,
      maxParticipants,
      isRegistrationOpen
    } = body;

    // Verify user is org admin
    const user = await requireOrgAdmin(request, organizationId);

    // Generate slug if not provided
    const eventSlug = slug || (await generateEventSlug(name, organizationId));

    // Validate slug format
    if (!validateSlug(eventSlug)) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();

    const submissionCode = generateSubmissionCode();

    // Create event
    const eventData = {
      name,
      description: description || '',
      location: location || '',
      address: address || '',
      coordinates: coordinates || null,
      isActive: status === 'active',
      status: status || 'upcoming',
      phase: 'registration', // Default to registration phase
      votingModel: votingModel || 'peer',
      startDate,
      endDate,
      submissionDeadline: submissionDeadline || null,
      keyboardsDownTime: keyboardsDownTime || null,
      createdAt: new Date().toISOString(),
      themesGenerated: false,
      isLive: false,
      showVotes: true, // Default to true, organizers can hide later
      scoresRevealed: false,
      // Multi-tenant fields
      slug: eventSlug,
      organizationId,
      visibility: visibility || 'public',
      createdBy: user.uid,
      updatedAt: new Date().toISOString(),
      submissionCode,
      // Registration fields
      maxParticipants: maxParticipants || 50,
      currentRegistrations: 0,
      isRegistrationOpen: isRegistrationOpen !== undefined ? isRegistrationOpen : true,
    };

    const eventRef = await db.collection('events').add(eventData);

    return NextResponse.json({
      success: true,
      eventId: eventRef.id,
      slug: eventSlug,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
