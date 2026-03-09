'use client';

import Link from 'next/link';
import { ArrowLeft, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { useVoting } from '@/context/VotingContext';

export default function LeaderboardPage() {
  const { eventName, votes } = useVoting();

  const handleRefresh = () => {
    window.location.reload();
  };

  return (
    <div>
      <header className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>

        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Leaderboard</h1>
            <p className="text-zinc-400">
              {eventName} • {votes.length} total vote{votes.length !== 1 ? 's' : ''}
            </p>
          </div>
          <Button variant="ghost" onClick={handleRefresh}>
            <RefreshCw size={18} className="mr-2" />
            Refresh
          </Button>
        </div>
      </header>

      <LeaderboardTable />

      <footer className="mt-8 text-center text-sm text-zinc-500">
        <p>Tiebreaker: Fewer git commits wins</p>
      </footer>
    </div>
  );
}
