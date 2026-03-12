'use client';

import React, { createContext, useContext, ReactNode } from 'react';
import { useTeams as useTeamsHook } from '@/hooks/useTeams';
import { Team } from '@/lib/types';

interface TeamContextType {
  teams: Team[];
  isLoading: boolean;
  error: string | null;
  eventName: string;
  getTeamById: (id: string) => Team | undefined;
  getTeamsByEventId: (eventId: string) => Team[];
  addTeam: (team: Omit<Team, 'id'>) => Promise<void>;
  updateTeam: (team: Team) => Promise<void>;
  deleteTeam: (teamId: string) => Promise<void>;
}

const TeamContext = createContext<TeamContextType | undefined>(undefined);

export function TeamProvider({ children }: { children: ReactNode }) {
  const { 
    teams, 
    isLoading, 
    error, 
    eventName, 
    getTeamById, 
    addTeam, 
    updateTeam, 
    removeTeam 
  } = useTeamsHook();

  const getTeamsByEventId = (eventId: string): Team[] => {
    return teams.filter((team) => team.eventId === eventId);
  };

  return (
    <TeamContext.Provider
      value={{
        teams,
        isLoading,
        error,
        eventName,
        getTeamById,
        getTeamsByEventId,
        addTeam,
        updateTeam,
        deleteTeam: removeTeam,
      }}
    >
      {children}
    </TeamContext.Provider>
  );
}

export function useTeams() {
  const context = useContext(TeamContext);
  if (context === undefined) {
    throw new Error('useTeams must be used within a TeamProvider');
  }
  return context;
}
