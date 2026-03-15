'use server';

import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { Team } from '@/lib/types';

export async function fetchRealityBuildathon(limit: number = 5): Promise<Team[]> {
  try {
    const db = getFirestoreAdmin();

    // Find the Reality Buildathon event
    const eventsSnapshot = await db
      .collection('events')
      .where('name', '==', 'Reality Buildathon')
      .limit(1)
      .get();

    if (eventsSnapshot.empty) {
      console.error('Reality Buildathon event not found');
      return [];
    }

    const realityBuildathonId = eventsSnapshot.docs[0].id;

    // Get teams from Reality Buildathon
    const teamsSnapshot = await db
      .collection('teams')
      .where('eventId', '==', realityBuildathonId)
      .limit(limit)
      .get();

    if (teamsSnapshot.empty) {
      return [];
    }

    // Convert to Team objects
    const teams: Team[] = teamsSnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as Team));

    return teams;

  } catch (error) {
    console.error('Error fetching Reality Buildathon submissions:', error);
    return [];
  }
}

export async function fetchWinnerProject(): Promise<Team | null> {
  try {
    const db = getFirestoreAdmin();

    // Find the Reality Buildathon event
    const eventsSnapshot = await db
      .collection('events')
      .where('name', '==', 'Reality Buildathon')
      .limit(1)
      .get();

    if (eventsSnapshot.empty) {
      console.error('Reality Buildathon event not found');
      return null;
    }

    const realityBuildathonId = eventsSnapshot.docs[0].id;

    // Get all teams from Reality Buildathon
    const teamsSnapshot = await db
      .collection('teams')
      .where('eventId', '==', realityBuildathonId)
      .get();

    if (teamsSnapshot.empty) {
      return null;
    }

    // Find JJ's "content repurposer" project
    const winnerDoc = teamsSnapshot.docs.find(doc => {
      const data = doc.data();
      const projectName = data.projectName?.toLowerCase() || '';
      const name = data.name?.toLowerCase() || '';
      return projectName.includes('content repurposer') || name.includes('content repurposer');
    });

    if (winnerDoc) {
      return {
        id: winnerDoc.id,
        ...winnerDoc.data()
      } as Team;
    }

    // Fallback to first team if winner not found
    return {
      id: teamsSnapshot.docs[0].id,
      ...teamsSnapshot.docs[0].data()
    } as Team;

  } catch (error) {
    console.error('Error fetching winner project:', error);
    return null;
  }
}
