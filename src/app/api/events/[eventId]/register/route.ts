import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin, getFirebaseAdmin } from '@/lib/firebase-admin';
import { verifyFirebaseToken, handleAuthError } from '@/lib/auth-helpers';
import { RegistrationStatus } from '@/lib/types';

/**
 * POST /api/events/[eventId]/register
 * Register current user for an event with metadata
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const body = await request.json();
    const { skillLevel, teamIntent, displayName, email } = body;
    const user = await verifyFirebaseToken(request);
    
    const db = getFirestoreAdmin();
    const eventRef = db.collection('events').doc(eventId);
    const registrationsRef = db.collection('registrations');
    
    const result = await db.runTransaction(async (transaction) => {
      const eventDoc = await transaction.get(eventRef);
      
      if (!eventDoc.exists) {
        throw new Error('Event not found');
      }
      
      const eventData = eventDoc.data()!;
      
      // Identity resolution: use provided guest info, then user account info, then fallbacks
      const finalDisplayName = displayName || user.displayName || 'Guest';
      const finalEmail = email || user.email || '';

      if (!finalEmail) {
        throw new Error('Email is required for registration');
      }

      // Check if user (UID) is already registered
      const regId = `${eventId}_${user.uid}`;
      const existingRegByUid = await transaction.get(registrationsRef.doc(regId));
        
      if (existingRegByUid.exists) {
        return { alreadyRegistered: true, status: existingRegByUid.data()?.status };
      }

      // Check if EMAIL is already registered for this specific event
      const existingRegByEmailQuery = registrationsRef
        .where('eventId', '==', eventId)
        .where('email', '==', finalEmail.toLowerCase())
        .limit(1);
      
      const emailSnapshot = await transaction.get(existingRegByEmailQuery);
      
      if (!emailSnapshot.empty) {
        return { 
          alreadyRegistered: true, 
          status: emailSnapshot.docs[0].data()?.status,
          message: 'This email is already registered for this event. Please sign in with your other account.'
        };
      }
      
      const currentCount = eventData.currentRegistrations || 0;
      const maxParticipants = eventData.maxParticipants || 50;
      
      let status: RegistrationStatus = 'approved';
      if (currentCount >= maxParticipants) {
        status = 'waitlisted';
      }

      const regData = {
        id: regId,
        eventId,
        userId: user.uid,
        email: finalEmail.toLowerCase(),
        displayName: finalDisplayName,
        status,
        registeredAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        organizationId: eventData.organizationId,
        metadata: {
          skillLevel: skillLevel || 'intermediate',
          teamIntent: teamIntent || 'solo',
        }
      };
      
      transaction.set(registrationsRef.doc(regId), regData);
      
      if (status === 'approved') {
        transaction.update(eventRef, {
          currentRegistrations: currentCount + 1,
          updatedAt: new Date().toISOString()
        });
      }
      
      return { success: true, status };
    });
    
    if (result.alreadyRegistered) {
      return NextResponse.json({ 
        message: result.message || 'You are already registered for this event', 
        status: result.status 
      });
    }

    return NextResponse.json({
      success: true,
      status: result.status,
      message: result.status === 'approved' 
        ? 'Successfully registered!' 
        : 'Event is full. You have been added to the waitlist.'
    });
  } catch (error: any) {
    return handleAuthError(error);
  }
}

/**
 * DELETE /api/events/[eventId]/register
 * Withdraw from an event and trigger waitlist promotion
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const user = await verifyFirebaseToken(request);
    
    const db = getFirestoreAdmin();
    const eventRef = db.collection('events').doc(eventId);
    const regRef = db.collection('registrations').doc(`${eventId}_${user.uid}`);
    
    await db.runTransaction(async (transaction) => {
      const regDoc = await transaction.get(regRef);
      if (!regDoc.exists) return;
      
      const eventDoc = await transaction.get(eventRef);
      if (!eventDoc.exists) return;
      
      const eventData = eventDoc.data()!;
      const oldStatus = regDoc.data()?.status;
      
      let nextRegDoc = null;
      
      // If the withdrawing user was 'approved', check for someone to promote
      if (oldStatus === 'approved') {
        const waitlistedQuery = db.collection('registrations')
          .where('eventId', '==', eventId)
          .where('status', '==', 'waitlisted');
          
        const waitlistedSnapshot = await transaction.get(waitlistedQuery);
        if (!waitlistedSnapshot.empty) {
          // Find the one with the earliest registeredAt
          nextRegDoc = waitlistedSnapshot.docs.sort((a, b) => {
            const dateA = new Date(a.data().registeredAt || 0).getTime();
            const dateB = new Date(b.data().registeredAt || 0).getTime();
            return dateA - dateB;
          })[0];
        }
      }

      // --- ALL READS COMPLETED ABOVE, ALL WRITES BELOW ---

      // Delete the registration
      transaction.delete(regRef);
      
      if (oldStatus === 'approved') {
        if (nextRegDoc) {
          transaction.update(nextRegDoc.ref, { 
            status: 'approved',
            updatedAt: new Date().toISOString()
          });
          // Count stays the same (one out, one in)
        } else {
          // No one on waitlist, just decrement
          transaction.update(eventRef, {
            currentRegistrations: Math.max(0, (eventData.currentRegistrations || 1) - 1)
          });
        }
      }
    });
    
    return NextResponse.json({ success: true, message: 'Successfully withdrawn' });
  } catch (error: any) {
    console.error('[WITHDRAWAL ERROR]', error);
    return handleAuthError(error);
  }
}

/**
 * GET /api/events/[eventId]/register
 * Check registration status of the current user
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { eventId: string } }
) {
  try {
    const eventId = params.eventId;
    const user = await verifyFirebaseToken(request);
    
    const db = getFirestoreAdmin();
    const regId = `${eventId}_${user.uid}`;
    const regDoc = await db.collection('registrations').doc(regId).get();
    
    if (!regDoc.exists) {
      return NextResponse.json({ registered: false });
    }
    
    return NextResponse.json({ 
      registered: true, 
      registration: regDoc.data() 
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
