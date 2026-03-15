import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { verifyFirebaseToken, handleAuthError } from '@/lib/auth-helpers';

/**
 * GET /api/user/registrations
 * Fetch all event registrations for the current user
 */
export async function GET(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);

    const db = getFirestoreAdmin();

    // Fetch all registrations for this user
    const registrationsSnapshot = await db
      .collection('registrations')
      .where('userId', '==', user.uid)
      .get();

    if (registrationsSnapshot.empty) {
      return NextResponse.json({ registrations: [] });
    }

    // Get all event IDs from registrations
    const eventIds = Array.from(new Set(registrationsSnapshot.docs.map(doc => doc.data().eventId)));

    // Fetch event details for all registered events
    const eventPromises = eventIds.map(eventId =>
      db.collection('events').doc(eventId).get()
    );
    const eventDocs = await Promise.all(eventPromises);

    // Create a map of event data
    const eventsMap = new Map();
    eventDocs.forEach(doc => {
      if (doc.exists) {
        eventsMap.set(doc.id, { id: doc.id, ...doc.data() });
      }
    });

    // For waitlisted registrations, calculate waitlist position
    const registrationsWithEvents = await Promise.all(
      registrationsSnapshot.docs.map(async (doc) => {
        const regData = doc.data();
        const event = eventsMap.get(regData.eventId);

        let waitlistPosition = null;

        // Calculate waitlist position if status is waitlisted
        if (regData.status === 'waitlisted') {
          const waitlistedSnapshot = await db
            .collection('registrations')
            .where('eventId', '==', regData.eventId)
            .where('status', '==', 'waitlisted')
            .get();

          // Sort by registeredAt and find position
          const waitlisted = waitlistedSnapshot.docs
            .map(d => ({ id: d.id, ...d.data() }))
            .sort((a: any, b: any) => {
              const dateA = new Date(a.registeredAt || 0).getTime();
              const dateB = new Date(b.registeredAt || 0).getTime();
              return dateA - dateB;
            });

          const position = waitlisted.findIndex((r: any) => r.id === doc.id);
          waitlistPosition = position !== -1 ? position + 1 : null;
        }

        return {
          id: doc.id,
          eventId: regData.eventId,
          userId: regData.userId,
          email: regData.email,
          displayName: regData.displayName,
          status: regData.status,
          registeredAt: regData.registeredAt,
          updatedAt: regData.updatedAt,
          organizationId: regData.organizationId,
          metadata: regData.metadata,
          event,
          waitlistPosition
        };
      })
    );

    // Sort by registration date (newest first)
    const sortedRegistrations = registrationsWithEvents.sort((a, b) => {
      const dateA = new Date(a.registeredAt || 0).getTime();
      const dateB = new Date(b.registeredAt || 0).getTime();
      return dateB - dateA;
    });

    return NextResponse.json({ registrations: sortedRegistrations });
  } catch (error) {
    return handleAuthError(error);
  }
}
