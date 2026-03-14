'use client';

import { Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, RefreshCw, Loader2, Trophy } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { useEventBySlug } from '@/hooks/useEventBySlug';
import { useVoting } from '@/context/VotingContext';
import { useTeams } from '@/context/TeamContext';

function LeaderboardBySlugContent() {
  const params = useParams();
  const slug = params.slug as string;

  const { event, isLoading: isEventLoading } = useEventBySlug(slug);
  const { votes } = useVoting();
  const { teams } = useTeams();

  const handleRefresh = () => {
    window.location.reload();
  };

  const displayVoteCount = useMemo(() => {
    if (!event) return 0;

    const eventTeamIds = new Set(
      teams.filter(t => t.eventId === event.id).map(t => t.id)
    );

    return votes.filter(v => eventTeamIds.has(v.teamId)).length;
  }, [votes, teams, event]);

  if (isEventLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Trophy size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Event Not Found</h2>
        <p className="text-zinc-400 mb-6">
          The event you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/events"
          className="text-accent hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div>
      <header className="mb-8">
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={20} />
          Back to {event.name}
        </Link>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Leaderboard</h1>
            <p className="text-zinc-400">
              {event.name} • {displayVoteCount} total vote{displayVoteCount !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <LeaderboardTable eventId={event.id} />

      <footer className="mt-8 text-center text-sm text-zinc-500">
        <p>Tiebreaker: Fewer git commits wins</p>
      </footer>
    </div>
  );
}

export default function LeaderboardBySlugPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      }
    >
      <LeaderboardBySlugContent />
    </Suspense>
  );
}
