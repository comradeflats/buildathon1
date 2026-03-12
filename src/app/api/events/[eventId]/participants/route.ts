import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { verifyFirebaseToken, requireOrgAdmin, handleAuthError } from '@/lib/auth-helpers';
import { RegistrationStatus } from '@/lib/types';

/**
 * GET /api/events/[id]/participants
 * Fetch all registrations for an event (Admin only)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const db = getFirestoreAdmin();
    
    // Get event to check organizationId
    const eventDoc = await db.collection('events').doc(eventId).get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const eventData = eventDoc.data()!;
    // Verify admin permissions
    await requireOrgAdmin(request, eventData.organizationId);
    
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    
    let query = db.collection('registrations').where('eventId', '==', eventId);
    
    if (status && status !== 'all') {
      query = query.where('status', '==', status);
    }
    
    const snapshot = await query.orderBy('registeredAt', 'desc').get();
    const participants = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ participants });
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * PUT /api/events/[id]/participants
 * Update a participant's registration status
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const body = await request.json();
    const { userId, status } = body as { userId: string; status: RegistrationStatus };
    
    if (!userId || !status) {
      return NextResponse.json({ error: 'Missing userId or status' }, { status: 400 });
    }
    
    const db = getFirestoreAdmin();
    const eventRef = db.collection('events').doc(eventId);
    const regRef = db.collection('registrations').doc(`${eventId}_${userId}`);
    
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const eventData = eventDoc.data()!;
    await requireOrgAdmin(request, eventData.organizationId);
    
    await db.runTransaction(async (transaction) => {
      const regDoc = await transaction.get(regRef);
      if (!regDoc.exists) {
        throw new Error('Registration not found');
      }
      
      const oldStatus = regDoc.data()?.status as RegistrationStatus;
      
      // Update registration
      transaction.update(regRef, { 
        status, 
        updatedAt: new Date().toISOString() 
      });
      
      // Update event count if status changed to/from 'approved'
      if (oldStatus !== 'approved' && status === 'approved') {
        transaction.update(eventRef, {
          currentRegistrations: (eventData.currentRegistrations || 0) + 1
        });
      } else if (oldStatus === 'approved' && status !== 'approved') {
        transaction.update(eventRef, {
          currentRegistrations: Math.max(0, (eventData.currentRegistrations || 1) - 1)
        });
      }
    });
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.message === 'Registration not found') {
      return NextResponse.json({ error: error.message }, { status: 404 });
    }
    return handleAuthError(error);
  }
}

/**
 * DELETE /api/events/[id]/participants
 * Remove a participant (Admin only)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 });
    }
    
    const db = getFirestoreAdmin();
    const eventRef = db.collection('events').doc(eventId);
    const regRef = db.collection('registrations').doc(`${eventId}_${userId}`);
    
    const eventDoc = await eventRef.get();
    if (!eventDoc.exists) {
      return NextResponse.json({ error: 'Event not found' }, { status: 404 });
    }
    
    const eventData = eventDoc.data()!;
    await requireOrgAdmin(request, eventData.organizationId);
    
    await db.runTransaction(async (transaction) => {
      const regDoc = await transaction.get(regRef);
      if (!regDoc.exists) return;
      
      const status = regDoc.data()?.status;
      if (status === 'approved') {
        transaction.update(eventRef, {
          currentRegistrations: Math.max(0, (eventData.currentRegistrations || 1) - 1)
        });
      }
      
      transaction.delete(regRef);
    });
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
