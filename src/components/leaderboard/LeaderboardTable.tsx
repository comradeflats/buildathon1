'use client';

import { LeaderboardRow } from './LeaderboardRow';
import { useVoting } from '@/context/VotingContext';
import { useEvents } from '@/hooks/useEvents';
import { Loader2, Eye, EyeOff } from 'lucide-react';

interface LeaderboardTableProps {
  eventId?: string;
}

export function LeaderboardTable({ eventId }: LeaderboardTableProps) {
  const { getLeaderboard, isLoading, isVotesLoaded } = useVoting();
  const { events, isLoading: isEventsLoading } = useEvents();

  if (isLoading || !isVotesLoaded || isEventsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const leaderboard = getLeaderboard(eventId);

  // Check if scores should be revealed
  // If no eventId provided, check if ALL events have scores revealed
  // If eventId provided, check that specific event
  const shouldShowScores = (() => {
    if (eventId) {
      const event = events.find(e => e.id === eventId);
      return event?.scoresRevealed !== false && event?.showVotes !== false; // Hide if either is false
    }
    const relevantEvents = events.filter(e => e.status === 'active' || e.status === 'archived');
    if (relevantEvents.length === 0) return true;
    return relevantEvents.every(e => e.scoresRevealed !== false && e.showVotes !== false);
  })();

  if (leaderboard.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p>No teams found.</p>
      </div>
    );
  }

  const hasVotes = leaderboard.some((ts) => ts.voteCount > 0);

  return (
    <div className="space-y-3">
      {!shouldShowScores && hasVotes && (
        <div className="flex items-center gap-3 p-4 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
          <EyeOff size={20} />
          <div>
            <p className="font-medium">Scores Hidden</p>
            <p className="text-sm text-amber-400/80">Results will be revealed after voting closes</p>
          </div>
        </div>
      )}
      {!hasVotes && (
        <div className="text-center py-8 text-zinc-400 bg-card rounded-lg border border-zinc-800">
          <p>No votes have been submitted yet.</p>
          <p className="text-sm mt-1">Vote on projects to see them ranked here!</p>
        </div>
      )}
      {leaderboard.map((teamScore, index) => (
        <LeaderboardRow
          key={teamScore.teamId}
          teamScore={teamScore}
          rank={shouldShowScores ? index + 1 : undefined}
          hideScores={!shouldShowScores}
        />
      ))}
    </div>
  );
}
