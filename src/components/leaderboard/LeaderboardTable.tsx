'use client';

import { LeaderboardRow } from './LeaderboardRow';
import { useVoting } from '@/context/VotingContext';
import { Loader2 } from 'lucide-react';

export function LeaderboardTable() {
  const { getLeaderboard, isLoading, isVotesLoaded } = useVoting();

  if (isLoading || !isVotesLoaded) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const leaderboard = getLeaderboard();

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
          rank={index + 1}
        />
      ))}
    </div>
  );
}
