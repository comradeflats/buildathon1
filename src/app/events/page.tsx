'use client';

import Link from 'next/link';
import { Calendar, ChevronRight, Users, Loader2, Clock, CheckCircle, Archive } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';

export default function EventsPage() {
  const { events, isLoading: isEventsLoading } = useEvents();
  const { teams, isLoading: isTeamsLoading } = useTeams();

  const isLoading = isEventsLoading || isTeamsLoading;

  const getTeamCountForEvent = (eventId: string) => {
    return teams.filter((team) => team.eventId === eventId).length;
  };

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className="text-emerald-500" />;
      case 'upcoming':
        return <Clock size={14} className="text-yellow-500" />;
      case 'archived':
        return <Archive size={14} className="text-zinc-500" />;
      default:
        return null;
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white flex items-center gap-3">
            <Calendar size={32} className="text-accent" />
            Event Library
          </h1>
          <p className="text-zinc-400 mt-2">
            Browse past and current buildathon events
          </p>
        </div>
        <Link
          href="/"
          className="text-zinc-400 hover:text-white transition-colors text-sm flex items-center gap-1"
        >
          Back to Home
          <ChevronRight size={16} />
        </Link>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Events Yet</h2>
          <p className="text-zinc-400">
            Check back later for upcoming buildathon events.
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {events.map((event) => {
            const teamCount = getTeamCountForEvent(event.id);

            return (
              <Link key={event.id} href={`/events/${event.id}`}>
                <Card hover className="p-6 h-full">
                  <div className="flex items-start justify-between mb-4">
                    <h2 className="text-lg font-semibold text-white group-hover:text-accent transition-colors">
                      {event.name}
                    </h2>
                    <Badge
                      variant={
                        event.status === 'active'
                          ? 'success'
                          : event.status === 'upcoming'
                          ? 'default'
                          : 'secondary'
                      }
                    >
                      {statusIcon(event.status)}
                      <span className="ml-1 capitalize">{event.status}</span>
                    </Badge>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Users size={14} />
                      <span>{teamCount} {teamCount === 1 ? 'project' : 'projects'}</span>
                    </div>
                    {event.startDate && event.endDate ? (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>
                          {new Date(event.startDate).toLocaleDateString('en-GB')} – {new Date(event.endDate).toLocaleDateString('en-GB')}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-1">
                        <Calendar size={14} />
                        <span>{new Date(event.createdAt).toLocaleDateString('en-GB')}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-800">
                    <span className="text-accent text-sm flex items-center gap-1 group-hover:gap-2 transition-all">
                      View Projects
                      <ChevronRight size={16} />
                    </span>
                  </div>
                </Card>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
