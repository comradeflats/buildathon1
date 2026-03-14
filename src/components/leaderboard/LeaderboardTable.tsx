'use client';

import { useEffect, useState, useRef } from 'react';
import { LeaderboardRow } from './LeaderboardRow';
import { useVoting } from '@/context/VotingContext';
import { useTeams } from '@/context/TeamContext';
import { useEvents } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';

interface LeaderboardTableProps {
  eventId?: string;
}

export function LeaderboardTable({ eventId }: LeaderboardTableProps) {
  const { getLeaderboard, isVotesLoaded } = useVoting();
  const { isLoading: isTeamsLoading } = useTeams();
  const { events, isLoading: isEventsLoading } = useEvents();

  if (isTeamsLoading || !isVotesLoaded || isEventsLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
        <p className="text-sm text-zinc-500 font-medium">Loading teams and votes...</p>
      </div>
    );
  }

  const leaderboard = getLeaderboard(eventId);

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p>No teams found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="space-y-3">
        {leaderboard.map((teamScore, index) => (
          <LeaderboardRow
            key={teamScore.teamId}
            teamScore={teamScore}
            rank={index + 1}
          />
        ))}
      </div>
    </div>
  );
}

