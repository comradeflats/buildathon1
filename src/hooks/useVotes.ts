'use client';

import { useState, useEffect, useCallback } from 'react';
import { 
  collection, 
  onSnapshot, 
  addDoc, 
  query, 
  where, 
  Timestamp,
  doc,
  setDoc,
  getDocs
} from 'firebase/firestore';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';
import { db, auth } from '@/lib/firebase';
import { Vote, Scores } from '@/lib/types';

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [userVotes, setUserVotes] = useState<Vote[]>([]);
  const [judgeId, setJudgeId] = useState<string | null>(null);
  const [favoriteTeamId, setFavoriteTeam] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // 1. Listen for Auth State (no auto sign-in - user must explicitly sign in to vote)
  useEffect(() => {
    if (!auth) return;

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setJudgeId(user.uid);
      } else {
        // Don't auto sign-in - require explicit auth action for voting
        setJudgeId(null);
      }
    });
    return () => unsubscribe();
  }, []);

  // 2. Listen to ALL votes (for collective leaderboard)
  useEffect(() => {
    if (!db) return;

    const q = query(collection(db, 'votes'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const allVotes = snapshot.docs.map(doc => ({
        ...doc.data(),
        id: doc.id
      })) as Vote[];
      setVotes(allVotes);
      setIsLoaded(true);
    });
    return () => unsubscribe();
  }, []);

  // 3. Track current user's specific state (favorites and voted IDs)
  useEffect(() => {
    if (!judgeId || votes.length === 0) return;
    
    const myVotes = votes.filter(v => v.judgeId === judgeId);
    setUserVotes(myVotes);
    
    const fav = myVotes.find(v => v.isFavorite);
    if (fav) setFavoriteTeam(fav.teamId);
  }, [votes, judgeId]);

  const submitVote = useCallback(async (teamId: string, scores: Scores, isFavorite: boolean = false): Promise<void> => {
    if (!judgeId) throw new Error("Must be logged in to vote");

    // If this is a new favorite, we need to un-favorite previous ones for this user
    if (isFavorite) {
      const myVotes = votes.filter(v => v.judgeId === judgeId && v.isFavorite);
      for (const oldVote of myVotes) {
        const voteRef = doc(db, 'votes', oldVote.id);
        await setDoc(voteRef, { isFavorite: false }, { merge: true });
      }
    }

    const voteData = {
      teamId,
      judgeId,
      scores,
      isFavorite,
      submittedAt: new Date().toISOString(),
    };

    try {
      await addDoc(collection(db, 'votes'), voteData);
    } catch (err) {
      console.error("Error submitting vote:", err);
      throw err;
    }
  }, [judgeId, votes]);

  const hasVotedFor = useCallback(
    (teamId: string): boolean => {
      return userVotes.some(v => v.teamId === teamId);
    },
    [userVotes]
  );

  const toggleFavorite = useCallback(async (teamId: string) => {
    if (!judgeId) return;
    
    // In Firebase, we update the specific vote document
    const myVote = userVotes.find(v => v.teamId === teamId);
    if (!myVote) return;

    // Remove other favorites first
    const otherFavs = userVotes.filter(v => v.isFavorite && v.teamId !== teamId);
    for (const fav of otherFavs) {
      await setDoc(doc(db, 'votes', fav.id), { isFavorite: false }, { merge: true });
    }

    const voteRef = doc(db, 'votes', myVote.id);
    await setDoc(voteRef, { isFavorite: !myVote.isFavorite }, { merge: true });
  }, [judgeId, userVotes]);

  const isFavorite = useCallback(
    (teamId: string): boolean => {
      return userVotes.some(v => v.teamId === teamId && v.isFavorite);
    },
    [userVotes]
  );

  const getVoteForTeam = useCallback(
    (teamId: string): Vote | undefined => {
      return userVotes.find(v => v.teamId === teamId);
    },
    [userVotes]
  );

  const updateVote = useCallback(async (
    voteId: string,
    scores: Scores,
    isFavorite: boolean
  ): Promise<void> => {
    if (!judgeId) throw new Error("Must be logged in to update vote");

    // Handle favorite logic - remove old favorite if setting new one
    if (isFavorite) {
      const otherFavs = userVotes.filter(v => v.isFavorite && v.id !== voteId);
      for (const fav of otherFavs) {
        await setDoc(doc(db, 'votes', fav.id), { isFavorite: false }, { merge: true });
      }
    }

    const voteRef = doc(db, 'votes', voteId);
    await setDoc(voteRef, {
      scores,
      isFavorite,
      updatedAt: new Date().toISOString(),
    }, { merge: true });
  }, [judgeId, userVotes]);

  const votedTeamIds = userVotes.map(v => v.teamId);

  return {
    votes,
    votedTeamIds,
    favoriteTeamId,
    isLoaded,
    submitVote,
    hasVotedFor,
    toggleFavorite,
    isFavorite,
    getVoteForTeam,
    updateVote,
  };
}
