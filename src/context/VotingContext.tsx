'use client';

import React, { createContext, useContext, ReactNode, useState, useCallback, useMemo } from 'react';
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
  currentEventId: string | null;
  setCurrentEventId: (eventId: string | null) => void;
  isLoading: boolean;
  isVotesLoaded: boolean;
  favoriteTeamId: string | null;
  submitVote: (teamId: string, scores: Scores, isFavorite?: boolean) => Promise<void>;
  hasVotedFor: (teamId: string) => boolean;
  getTeamById: (id: string) => Team | undefined;
  getTeamsByEventId: (eventId: string) => Team[];
  getThemeById: (id: string) => Theme | undefined;
  getThemeCriteria: (themeId: string) => string[];
  getThemesByEventId: (eventId: string) => Theme[];
  getLeaderboard: (eventId?: string) => TeamScore[];
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
  const { themes, getThemeById, getThemeCriteria, getThemesByEventId } = useThemes();
  const [toast, setToast] = useState<Toast | null>(null);
  const [currentEventId, setCurrentEventId] = useState<string | null>(null);

  // Filter votes to only include those for teams that exist in our state
  const validVotes = useMemo(() => {
    const teamIds = new Set(teams.map(t => t.id));
    return votes.filter(v => teamIds.has(v.teamId));
  }, [votes, teams]);

  const getTeamsByEventId = useCallback(
    (eventId: string): Team[] => {
      return teams.filter((team) => team.eventId === eventId);
    },
    [teams]
  );

  const getLeaderboard = useCallback(
    (eventId?: string) => {
      const filteredTeams = eventId
        ? teams.filter((team) => team.eventId === eventId)
        : teams;
      const filteredThemes = eventId
        ? themes.filter((theme) => theme.eventId === eventId)
        : themes;
      return calculateTeamScores(validVotes, filteredTeams, filteredThemes);
    },
    [validVotes, teams, themes]
  );

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
        votes: validVotes,
        votedTeamIds,
        teams,
        themes,
        eventName,
        currentEventId,
        setCurrentEventId,
        isLoading,
        isVotesLoaded,
        favoriteTeamId,
        submitVote,
        hasVotedFor,
        getTeamById,
        getTeamsByEventId,
        getThemeById,
        getThemeCriteria,
        getThemesByEventId,
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
