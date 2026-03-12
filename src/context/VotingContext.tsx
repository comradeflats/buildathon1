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
  type: 'success' | 'error' | 'info' | 'phase';
  icon?: string;
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
  getVoteForTeam: (teamId: string) => Vote | undefined;
  updateVote: (voteId: string, scores: Scores, isFavorite: boolean) => Promise<void>;
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
  toasts: Toast[];
  showToast: (message: string, type?: 'success' | 'error' | 'info' | 'phase', icon?: string) => void;
  clearToast: (id: string) => void;
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
    getVoteForTeam,
    updateVote,
  } = useVotes();
  const { teams, eventName, isLoading, getTeamById, addTeam, updateTeam, removeTeam } = useTeams();
  const { themes, getThemeById, getThemeCriteria, getThemesByEventId } = useThemes();
  const [toasts, setToasts] = useState<Toast[]>([]);
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

  const showToast = useCallback((message: string, type: 'success' | 'error' | 'info' | 'phase' = 'success', icon?: string) => {
    const id = Date.now().toString();
    setToasts((current) => [...current, { id, message, type, icon }]);
    setTimeout(() => {
      setToasts((current) => current.filter((t) => t.id !== id));
    }, 5000); // 5 seconds for live wire energy
  }, []);

  const clearToast = useCallback((id: string) => {
    setToasts((current) => current.filter((t) => t.id !== id));
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
        getVoteForTeam,
        updateVote,
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
        toasts,
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
