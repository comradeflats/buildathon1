'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback } from 'react';
import { useVotes } from '@/hooks/useVotes';
import { useTeams } from '@/hooks/useTeams';
import { useThemes } from '@/hooks/useThemes';
import { Vote, Scores, Team, TeamScore, Theme } from '@/lib/types';
import { calculateTeamScores } from '@/lib/scoring';

interface Toast {
  id: string;
  message: string;
  type: 'success' | 'error';
}

interface VotingContextType {
  votes: Vote[];
  votedTeamIds: string[];
  teams: Team[];
  themes: Theme[];
  eventName: string;
  isLoading: boolean;
  isVotesLoaded: boolean;
  favoriteTeamId: string | null;
  submitVote: (teamId: string, scores: Scores, isFavorite?: boolean) => Promise<void>;
  hasVotedFor: (teamId: string) => boolean;
  getTeamById: (id: string) => Team | undefined;
  getThemeById: (id: string) => Theme | undefined;
  getThemeCriteria: (themeId: string) => string[];
  getLeaderboard: () => TeamScore[];
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
  toggleFavorite: (teamId: string) => Promise<void>;
  isFavorite: (teamId: string) => boolean;
  toast: Toast | null;
  showToast: (message: string, type: 'success' | 'error') => void;
  clearToast: () => void;
}

const VotingContext = createContext<VotingContextType | undefined>(undefined);

export function VotingProvider({ children }: { children: ReactNode }) {
  const {
    votes,
    votedTeamIds,
    favoriteTeamId,
    isLoaded: isVotesLoaded,
    submitVote,
    hasVotedFor,
    toggleFavorite,
    isFavorite,
  } = useVotes();
  const { teams, eventName, isLoading, getTeamById, addTeam, updateTeam, removeTeam } = useTeams();
  const { themes, getThemeById, getThemeCriteria } = useThemes();
  const [toast, setToast] = useState<Toast | null>(null);

  const getLeaderboard = useCallback(() => {
    return calculateTeamScores(votes, teams, themes);
  }, [votes, teams, themes]);

  const showToast = useCallback((message: string, type: 'success' | 'error') => {
    const id = Date.now().toString();
    setToast({ id, message, type });
    setTimeout(() => {
      setToast((current) => (current?.id === id ? null : current));
    }, 3000);
  }, []);

  const clearToast = useCallback(() => {
    setToast(null);
  }, []);

  return (
    <VotingContext.Provider
      value={{
        votes,
        votedTeamIds,
        teams,
        themes,
        eventName,
        isLoading,
        isVotesLoaded,
        favoriteTeamId,
        submitVote,
        hasVotedFor,
        getTeamById,
        getThemeById,
        getThemeCriteria,
        getLeaderboard,
        addTeam,
        updateTeam,
        deleteTeam: removeTeam,
        toggleFavorite,
        isFavorite,
        toast,
        showToast,
        clearToast,
      }}
    >
      {children}
    </VotingContext.Provider>
  );
}

export function useVoting() {
  const context = useContext(VotingContext);
  if (context === undefined) {
    throw new Error('useVoting must be used within a VotingProvider');
  }
  return context;
}
