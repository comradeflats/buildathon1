'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  query, 
  orderBy 
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Team } from '@/lib/types';
import { EVENT_NAME } from '@/lib/constants';

export function useTeams() {
  const [teams, setTeams] = useState<Team[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) return;

    // Listen to teams collection in real-time
    const q = query(collection(db, 'teams'), orderBy('projectName', 'asc'));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const teamsData = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Team[];
      
      setTeams(teamsData);
      setIsLoading(false);
    }, (err) => {
      console.error("Error fetching teams:", err);
      setError(err.message);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const getTeamById = useCallback(
    (id: string): Team | undefined => {
      return teams.find((team) => team.id === id);
    },
    [teams]
  );

  const addTeam = useCallback(async (team: Omit<Team, 'id'>): Promise<void> => {
    try {
      await addDoc(collection(db, 'teams'), team);
    } catch (err) {
      console.error("Error adding team:", err);
      throw err;
    }
  }, []);

  const updateTeam = useCallback(async (updatedTeam: Team): Promise<void> => {
    try {
      const { id, submissionCode, ...data } = updatedTeam; // Remove submissionCode before update
      const teamRef = doc(db, id ? doc(db, 'teams', id) : collection(db, 'teams')); // Handle missing ID gracefully
      if (id) {
        await updateDoc(doc(db, 'teams', id), data as any);
      }
    } catch (err) {
      console.error("Error updating team:", err);
      throw err;
    }
  }, []);

  const removeTeam = useCallback(async (teamId: string): Promise<void> => {
    try {
      await deleteDoc(doc(db, 'teams', teamId));
    } catch (err) {
      console.error("Error removing team:", err);
      throw err;
    }
  }, []);

  const eventName = EVENT_NAME;

  return { teams, eventName, isLoading, error, getTeamById, addTeam, updateTeam, removeTeam };
}
