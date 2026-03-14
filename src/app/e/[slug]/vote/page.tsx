'use client';

import { Suspense, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, Vote as VoteIcon } from 'lucide-react';
import { useEventBySlug } from '@/hooks/useEventBySlug';
import { useTeams } from '@/hooks/useTeams';
import { TeamCard } from '@/components/gallery/TeamCard';
import { Card } from '@/components/ui/Card';

function VoteBySlugContent() {
  const params = useParams();
  const slug = params.slug as string;

  const { event, isLoading: isEventLoading } = useEventBySlug(slug);
  const { teams, isLoading: isTeamsLoading } = useTeams();

  const isLoading = isEventLoading || isTeamsLoading;

  const eventTeams = useMemo(() => {
    if (!event) return [];
    return teams.filter((team) => team.eventId === event.id);
  }, [teams, event]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <VoteIcon size={48} className="text-zinc-600 mb-4" />
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
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to {event.name}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <VoteIcon size={32} className="text-accent" />
          <h1 className="text-3xl font-bold text-white">Vote on Projects</h1>
        </div>
        <p className="text-zinc-400">
          Select a project below to cast your vote for {event.name}
        </p>
      </div>

      {/* Projects Grid */}
      {eventTeams.length === 0 ? (
        <Card className="p-12 text-center">
          <VoteIcon size={48} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Projects Yet</h2>
          <p className="text-zinc-400">
            No projects have been submitted to this event yet. Check back later!
          </p>
        </Card>
      ) : (
        <div>
          <div className="text-sm text-zinc-400 mb-4">
            Showing {eventTeams.length} {eventTeams.length === 1 ? 'project' : 'projects'}
          </div>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventTeams.map((team) => (
              <TeamCard key={team.id} team={team} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export default function VoteBySlugPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      }
    >
      <VoteBySlugContent />
    </Suspense>
  );
}
