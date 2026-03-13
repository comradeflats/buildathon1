'use client';

import { useEffect, useState, useRef } from 'react';
import { LeaderboardRow } from './LeaderboardRow';
import { useVoting } from '@/context/VotingContext';
import { useTeams } from '@/context/TeamContext';
import { useEvents } from '@/hooks/useEvents';
import { Loader2, Eye, EyeOff, Trophy, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

interface LeaderboardTableProps {
  eventId?: string;
}

export function LeaderboardTable({ eventId }: LeaderboardTableProps) {
  const { getLeaderboard, isVotesLoaded } = useVoting();
  const { isLoading: isTeamsLoading } = useTeams();
  const { events, isLoading: isEventsLoading } = useEvents();
  const [hasCelebrated, setHasCelebrated] = useState(false);
  const lastRevealedRef = useRef<boolean | null>(null);

  const event = eventId ? events.find(e => e.id === eventId) : null;
  const isRevealed = event?.scoresRevealed === true;

  useEffect(() => {
    if (isRevealed && lastRevealedRef.current === false) {
      const duration = 5 * 1000;
      const animationEnd = Date.now() + duration;
      const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

      const randomInRange = (min: number, max: number) => Math.random() * (max - min) + min;

      const interval: any = setInterval(function() {
        const timeLeft = animationEnd - Date.now();

        if (timeLeft <= 0) {
          return clearInterval(interval);
        }

        const particleCount = 50 * (timeLeft / duration);
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 } });
        confetti({ ...defaults, particleCount, origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 } });
      }, 250);
      
      setHasCelebrated(true);
    }
    lastRevealedRef.current = isRevealed;
  }, [isRevealed]);

  if (isTeamsLoading || !isVotesLoaded || isEventsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const leaderboard = getLeaderboard(eventId);

  const shouldShowScores = (() => {
    if (eventId) {
      return event?.scoresRevealed !== false && event?.showVotes !== false;
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
  const winner = leaderboard[0];

  return (
    <div className="space-y-6">
      {isRevealed && winner && (
        <div className="relative overflow-hidden p-8 rounded-3xl bg-gradient-to-br from-yellow-500/20 via-yellow-500/5 to-transparent border border-yellow-500/30 animate-in zoom-in-95 duration-700">
           <div className="absolute top-0 right-0 p-4 opacity-10">
             <Trophy size={120} className="text-yellow-500" />
           </div>
           <div className="relative z-10 text-center space-y-4">
             <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/10 text-yellow-500 text-xs font-black uppercase tracking-widest border border-yellow-500/20">
               <Sparkles size={14} />
               Champion Revealed
             </div>
             <h2 className="text-5xl font-black text-white tracking-tighter">
               {winner.team.projectName}
             </h2>
             <p className="text-zinc-400 font-medium">
               Built by <span className="text-white">{winner.team.name}</span>
             </p>
           </div>
        </div>
      )}

      {!shouldShowScores && hasVotes && (
        <div className="flex items-center gap-3 p-6 bg-zinc-900/50 border border-zinc-800 rounded-2xl text-zinc-400">
          <EyeOff size={24} className="text-zinc-600" />
          <div>
            <p className="font-black text-white uppercase tracking-widest text-sm">Arena results are hidden</p>
            <p className="text-xs">Scores will be revealed once the organizer ends the review phase.</p>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {leaderboard.map((teamScore, index) => (
          <LeaderboardRow
            key={teamScore.teamId}
            teamScore={teamScore}
            rank={shouldShowScores ? index + 1 : undefined}
            hideScores={!shouldShowScores}
          />
        ))}
      </div>
    </div>
  );
}
