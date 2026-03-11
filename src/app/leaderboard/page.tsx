'use client';

import { useState, useEffect, Suspense, useMemo } from 'react';
import Link from 'next/link';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { ArrowLeft, RefreshCw, Filter, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { useVoting } from '@/context/VotingContext';
import { useEvents } from '@/hooks/useEvents';

function LeaderboardContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { votes, teams } = useVoting();
  const { events, isLoading: isEventsLoading, getEventById } = useEvents();

  const [selectedEventId, setSelectedEventId] = useState<string>(() => {
    return searchParams.get('eventId') || '';
  });

  // Sync with URL params when they change
  useEffect(() => {
    const eventIdFromUrl = searchParams.get('eventId') || '';
    if (eventIdFromUrl !== selectedEventId) {
      setSelectedEventId(eventIdFromUrl);
    }
  }, [searchParams, selectedEventId]);

  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    const params = new URLSearchParams(searchParams.toString());
    if (eventId) {
      params.set('eventId', eventId);
    } else {
      params.delete('eventId');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const handleRefresh = () => {
    window.location.reload();
  };

  const displayVoteCount = useMemo(() => {
    if (!selectedEventId) return votes.length;
    
    const eventTeamIds = new Set(
      teams.filter(t => t.eventId === selectedEventId).map(t => t.id)
    );
    
    return votes.filter(v => eventTeamIds.has(v.teamId)).length;
  }, [votes, teams, selectedEventId]);

  if (isEventsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  const selectedEvent = selectedEventId ? getEventById(selectedEventId) : null;
  const displayEventName = selectedEvent ? selectedEvent.name : 'All Events';

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

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">Leaderboard</h1>
            <p className="text-zinc-400">
              {displayEventName} • {displayVoteCount} total vote{displayVoteCount !== 1 ? 's' : ''}
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Event Filter */}
            <div className="relative min-w-[200px]">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
              <select
                value={selectedEventId}
                onChange={(e) => handleEventChange(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors appearance-none cursor-pointer text-sm"
              >
                <option value="">All Events</option>
                {events.map((event) => (
                  <option key={event.id} value={event.id}>
                    {event.name}
                  </option>
                ))}
              </select>
            </div>

            <Button variant="ghost" size="sm" onClick={handleRefresh}>
              <RefreshCw size={18} className="mr-2" />
              Refresh
            </Button>
          </div>
        </div>
      </header>

      <LeaderboardTable eventId={selectedEventId || undefined} />

      <footer className="mt-8 text-center text-sm text-zinc-500">
        <p>Tiebreaker: Fewer git commits wins</p>
      </footer>
    </div>
  );
}

export default function LeaderboardPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      }
    >
      <LeaderboardContent />
    </Suspense>
  );
}
