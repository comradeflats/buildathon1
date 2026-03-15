'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { Team } from '@/lib/types';

export async function fetchRandomSubmissions(limit: number = 3): Promise<Team[]> {
  try {
    const db = getFirestoreAdmin();

    // Get archived events
    const eventsSnapshot = await db
      .collection('events')
      .where('status', '==', 'archived')
      .limit(10) // Limit to recent archived events
      .get();

    if (eventsSnapshot.empty) {
      return [];
    }

    // Get all teams from archived events
    const archivedEventIds = eventsSnapshot.docs.map(doc => doc.id);

    // Firestore 'in' operator has a limit of 10 items
    const teamsSnapshot = await db
      .collection('teams')
      .where('eventId', 'in', archivedEventIds.slice(0, 10))
      .get();

    if (teamsSnapshot.empty) {
      return [];
    }

    // Convert to Team objects
    const teams: Team[] = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team));

    // Shuffle and return random selection
    const shuffled = teams.sort(() => Math.random() - 0.5);
    return shuffled.slice(0, limit);

  } catch (error) {
    console.error('Error fetching random submissions:', error);
    return [];
  }
}
