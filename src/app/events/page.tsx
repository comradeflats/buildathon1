'use client';

import { Suspense, useState, useMemo } from 'react';
import Link from 'next/link';
import { Calendar, ChevronRight, Users, Loader2, Clock, CheckCircle, Archive, MapPin, Search, Globe, LayoutGrid } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useSearchParams } from 'next/navigation';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';
import RegionalMap from '@/components/events/RegionalMap';

type ViewMode = 'grid' | 'map';

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    }>
      <EventsContent />
    </Suspense>
  );
}

function EventsContent() {
  const searchParams = useSearchParams();
  const initialView = searchParams.get('view') === 'map' ? 'map' : 'grid';

  const { events, isLoading: isEventsLoading } = useEvents();
  const { teams, isLoading: isTeamsLoading } = useTeams();
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<ViewMode>(initialView);

  const isLoading = isEventsLoading || isTeamsLoading;

  const filteredEvents = useMemo(() => {
    if (!searchQuery.trim()) return events;
    
    const query = searchQuery.toLowerCase();
    return events.filter(event => 
      event.name.toLowerCase().includes(query) || 
      event.location?.toLowerCase().includes(query) ||
      event.description?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
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

      {/* Filters & Controls */}
      <div className="flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/50 p-4 rounded-2xl border border-zinc-800">
        <div className="relative w-full sm:max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search by name, city or region..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-950 border border-zinc-800 rounded-xl py-2 pl-10 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500/50 transition-all"
          />
        </div>

        <div className="flex items-center gap-2 bg-zinc-950 p-1 rounded-xl border border-zinc-800">
          <Button
            variant={viewMode === 'grid' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('grid')}
            className={`rounded-lg ${viewMode === 'grid' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'}`}
          >
            <LayoutGrid size={18} className="mr-2" />
            Grid
          </Button>
          <Button
            variant={viewMode === 'map' ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('map')}
            className={`rounded-lg ${viewMode === 'map' ? 'bg-emerald-500 text-zinc-950' : 'text-zinc-400'}`}
          >
            <Globe size={18} className="mr-2" />
            Map
          </Button>
        </div>
      </div>

      {/* Content */}
      {viewMode === 'grid' ? (
        filteredEvents.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
            <h2 className="text-xl font-semibold text-white mb-2">No Events Found</h2>
            <p className="text-zinc-400">
              Try adjusting your search or check back later.
            </p>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredEvents.map((event) => {
              const teamCount = getTeamCountForEvent(event.id);

              return (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card hover className="p-6 h-full border-zinc-800 hover:border-emerald-500/30 transition-all group">
                    <div className="flex items-start justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white group-hover:text-emerald-400 transition-colors">
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
                      {event.location && (
                        <div className="flex items-center gap-1 text-emerald-400/80">
                          <MapPin size={14} />
                          <span className="font-medium">{event.location}</span>
                        </div>
                      )}
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
                      <span className="text-emerald-500 text-sm font-bold flex items-center gap-1 group-hover:gap-2 transition-all">
                        View Projects
                        <ChevronRight size={16} />
                      </span>
                    </div>
                  </Card>
                </Link>
              );
            })}
          </div>
        )
      ) : (
        <RegionalMap events={filteredEvents} />
      )}
    </div>
  );
}
