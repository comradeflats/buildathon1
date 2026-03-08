'use client';

import Link from 'next/link';
import { Trophy, Plus, Palette, Calendar, Settings, ChevronRight, Users, Loader2, Clock, CheckCircle, Archive, Rocket } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdmin } from '@/context/AdminContext';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';

export default function HomePage() {
  const { isAdmin } = useAdmin();
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

  // Separate events by status
  const activeEvents = events.filter((e) => e.status === 'active');
  const upcomingEvents = events.filter((e) => e.status === 'upcoming');
  const archivedEvents = events.filter((e) => e.status === 'archived');

  const formatEventDates = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString()} – ${end.toLocaleDateString()}`;
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              Buildathon Leaderboard
            </h1>
            <p className="text-zinc-400 text-sm md:text-base">
              Join an event, pick a theme, and submit your project
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="/themes" className="flex-1 md:flex-none">
              <Button variant="secondary" className="w-full">
                <Palette size={18} className="mr-2" />
                Themes
              </Button>
            </Link>
            <Link href="/leaderboard" className="flex-1 md:flex-none">
              <Button variant="secondary" className="w-full">
                <Trophy size={18} className="mr-2" />
                Leaderboard
              </Button>
            </Link>
            <Link href={isAdmin ? '/admin/dashboard' : '/admin'} className="flex-1 md:flex-none">
              <Button variant="secondary" className="w-full">
                <Settings size={18} className="mr-2" />
                Admin
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      ) : (
        <div className="space-y-8">
          {/* Active Events - Prominent */}
          {activeEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Rocket size={20} className="text-emerald-500" />
                Active Events
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeEvents.map((event) => {
                  const teamCount = getTeamCountForEvent(event.id);
                  const dateRange = formatEventDates(event.startDate, event.endDate);

                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card hover className="p-6 h-full border-emerald-500/30 bg-emerald-500/5">
                        <div className="flex items-start justify-between mb-3">
                          <h3 className="text-xl font-bold text-white">
                            {event.name}
                          </h3>
                          <Badge variant="success">
                            {statusIcon(event.status)}
                            <span className="ml-1">Live</span>
                          </Badge>
                        </div>

                        {event.description && (
                          <p className="text-sm text-zinc-400 mb-3">{event.description}</p>
                        )}

                        <div className="flex flex-wrap items-center gap-4 text-sm text-zinc-400 mb-4">
                          <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span>{teamCount} {teamCount === 1 ? 'project' : 'projects'}</span>
                          </div>
                          {dateRange && (
                            <div className="flex items-center gap-1">
                              <Calendar size={14} />
                              <span>{dateRange}</span>
                            </div>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-emerald-400 text-sm font-medium flex items-center gap-1">
                            Browse & Submit
                            <ChevronRight size={16} />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-yellow-500" />
                Upcoming Events
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => {
                  const dateRange = formatEventDates(event.startDate, event.endDate);

                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card hover className="p-5 h-full">
                        <div className="flex items-start justify-between mb-2">
                          <h3 className="font-semibold text-white">
                            {event.name}
                          </h3>
                          <Badge variant="default">
                            <Clock size={12} className="mr-1" />
                            Soon
                          </Badge>
                        </div>

                        {event.description && (
                          <p className="text-xs text-zinc-400 mb-2">{event.description}</p>
                        )}

                        {dateRange && (
                          <p className="text-xs text-zinc-500 flex items-center gap-1">
                            <Calendar size={12} />
                            {dateRange}
                          </p>
                        )}

                        <div className="mt-3 pt-3 border-t border-zinc-800">
                          <span className="text-accent text-sm flex items-center gap-1">
                            View Details
                            <ChevronRight size={14} />
                          </span>
                        </div>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {/* No Active or Upcoming Events */}
          {activeEvents.length === 0 && upcomingEvents.length === 0 && (
            <Card className="p-12 text-center">
              <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
              <h2 className="text-xl font-semibold text-white mb-2">No Active Events</h2>
              <p className="text-zinc-400 mb-4">
                Check back later for upcoming buildathon events.
              </p>
              {archivedEvents.length > 0 && (
                <Link href="/events">
                  <Button variant="secondary">
                    Browse Past Events
                    <ChevronRight size={16} className="ml-1" />
                  </Button>
                </Link>
              )}
            </Card>
          )}

          {/* Past Events - Collapsed */}
          {archivedEvents.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Archive size={20} className="text-zinc-500" />
                  Past Events
                </h2>
                <Link href="/events" className="text-sm text-zinc-400 hover:text-white flex items-center gap-1">
                  View All
                  <ChevronRight size={14} />
                </Link>
              </div>
              <div className="grid gap-3 md:grid-cols-3 lg:grid-cols-4">
                {archivedEvents.slice(0, 4).map((event) => {
                  const teamCount = getTeamCountForEvent(event.id);

                  return (
                    <Link key={event.id} href={`/events/${event.id}`}>
                      <Card hover className="p-4 h-full opacity-70 hover:opacity-100 transition-opacity">
                        <h3 className="font-medium text-white text-sm mb-1">{event.name}</h3>
                        <p className="text-xs text-zinc-500">
                          {teamCount} {teamCount === 1 ? 'project' : 'projects'}
                        </p>
                      </Card>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
