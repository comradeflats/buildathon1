'use client';

import { useState, useEffect, useCallback } from 'react';
import { Vote, Scores } from '@/lib/types';
import { getVotes, saveVote, getVotedTeamIds, getJudgeId, getFavoriteTeamId, setFavoriteTeamId } from '@/lib/storage';
import { v4 as uuidv4 } from 'uuid';

export function useVotes() {
  const [votes, setVotes] = useState<Vote[]>([]);
  const [votedTeamIds, setVotedTeamIds] = useState<string[]>([]);
  const [favoriteTeamId, setFavoriteTeam] = useState<string | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setVotes(getVotes());
    setVotedTeamIds(getVotedTeamIds());
    setFavoriteTeam(getFavoriteTeamId());
    setIsLoaded(true);
  }, []);

  const submitVote = useCallback((teamId: string, scores: Scores, isFavorite: boolean = false): Vote => {
    const vote: Vote = {
      id: uuidv4(),
      teamId,
      judgeId: getJudgeId(),
      scores,
      isFavorite,
      submittedAt: new Date().toISOString(),
    };

    saveVote(vote);
    setVotes((prev) => [...prev, vote]);
    setVotedTeamIds((prev) => [...prev, teamId]);

    // Update favorite if set
    if (isFavorite) {
      setFavoriteTeamId(teamId);
      setFavoriteTeam(teamId);
    }

    return vote;
  }, []);

  const hasVotedFor = useCallback(
    (teamId: string): boolean => {
      return votedTeamIds.includes(teamId);
    },
    [votedTeamIds]
  );

  const toggleFavorite = useCallback((teamId: string) => {
    const newFavorite = favoriteTeamId === teamId ? null : teamId;
    setFavoriteTeamId(newFavorite);
    setFavoriteTeam(newFavorite);
  }, [favoriteTeamId]);

  const isFavorite = useCallback(
    (teamId: string): boolean => {
      return favoriteTeamId === teamId;
    },
    [favoriteTeamId]
  );

  return {
    votes,
    votedTeamIds,
    favoriteTeamId,
    isLoaded,
    submitVote,
    hasVotedFor,
    toggleFavorite,
    isFavorite,
  };
}
