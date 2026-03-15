'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';

export async function fetchUpcomingEvents(limit: number = 1) {
  try {
    const db = getFirestoreAdmin();

    // Get upcoming events
    const eventsSnapshot = await db
      .collection('events')
      .where('status', '==', 'upcoming')
      .orderBy('startDate', 'asc')
      .limit(limit)
      .get();

    if (eventsSnapshot.empty) {
      return [];
    }

    return eventsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

  } catch (error) {
    console.error('Error fetching upcoming events:', error);
    return [];
  }
}
