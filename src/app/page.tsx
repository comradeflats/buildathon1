'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Trophy, Plus, Calendar, Settings, ChevronRight, Users, Loader2, Clock, CheckCircle, Archive, Rocket, LayoutGrid, Search, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdmin } from '@/context/AdminContext';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';
import { usePublicOrganizations } from '@/hooks/useOrganizations';

export default function HomePage() {
  const { isAdmin } = useAdmin();
  const { events, isLoading: isEventsLoading } = useEvents();
  const { teams, isLoading: isTeamsLoading } = useTeams();
  const { organizations, isLoading: isOrgsLoading } = usePublicOrganizations();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'upcoming' | 'archived'>('all');

  const isLoading = isEventsLoading || isTeamsLoading || isOrgsLoading;

  const getTeamCountForEvent = (eventId: string) => {
    return teams.filter((team) => team.eventId === eventId).length;
  };

  const getOrg = (orgId: string) => {
    return organizations.find(o => o.id === orgId);
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

  const formatEventDates = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-GB')} – ${end.toLocaleDateString('en-GB')}`;
  };

  // Filter events based on search and status
  const filteredEvents = events.filter((event) => {
    // Status filter
    if (statusFilter !== 'all' && event.status !== statusFilter) return false;

    // Visibility filter (only show public events)
    if (event.visibility && event.visibility !== 'public') return false;

    // Search query filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      const org = getOrg(event.organizationId || '');
      const orgName = org?.name?.toLowerCase() || '';
      
      return (
        event.name.toLowerCase().includes(query) ||
        (event.description && event.description.toLowerCase().includes(query)) ||
        orgName.includes(query)
      );
    }

    return true;
  });

  const activeEvents = filteredEvents.filter((e) => e.status === 'active');
  const upcomingEvents = filteredEvents.filter((e) => e.status === 'upcoming');
  const archivedEvents = filteredEvents.filter((e) => e.status === 'archived');

  const renderEventCard = (event: any, isProminent: boolean = false) => {
    const teamCount = getTeamCountForEvent(event.id);
    const dateRange = formatEventDates(event.startDate, event.endDate);
    const org = getOrg(event.organizationId || '');
    const eventUrl = event.slug ? `/e/${event.slug}` : `/events/${event.id}`;

    return (
      <Link key={event.id} href={eventUrl}>
        <Card hover className={`p-6 h-full ${isProminent ? 'border-emerald-500/30 bg-emerald-500/5' : ''}`}>
          <div className="flex items-start justify-between mb-3">
            <div>
              <h3 className={`font-bold text-white ${isProminent ? 'text-xl' : 'text-lg'}`}>
                {event.name}
              </h3>
              {org && (
                <div className="flex items-center gap-1.5 mt-1 text-sm text-zinc-400">
                  <Building2 size={14} />
                  <span>By <Link href={`/org/${org.slug}`} className="hover:text-accent hover:underline" onClick={(e) => e.stopPropagation()}>{org.name}</Link></span>
                </div>
              )}
            </div>
            {event.status === 'active' ? (
              <Badge variant="success" className="shrink-0">
                {statusIcon(event.status)}
                <span className="ml-1">Live</span>
              </Badge>
            ) : event.status === 'upcoming' ? (
              <Badge variant="default" className="shrink-0">
                <Clock size={12} className="mr-1" />
                Soon
              </Badge>
            ) : (
              <Badge variant="outline" className="shrink-0">
                Archived
              </Badge>
            )}
          </div>

          {event.description && (
            <p className={`text-zinc-400 mb-4 line-clamp-2 ${isProminent ? 'text-sm' : 'text-xs'}`}>{event.description}</p>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-zinc-400 mb-4 mt-auto pt-2 border-t border-zinc-800">
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
            <span className={`${isProminent ? 'text-emerald-400' : 'text-accent'} text-sm font-medium flex items-center gap-1`}>
              {event.status === 'active' ? 'Browse & Submit' : 'View Details'}
              <ChevronRight size={16} />
            </span>
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <div>
      <header className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2 flex items-center gap-2">
              <Rocket className="text-accent" size={28} />
              Buildathon Discovery
            </h1>
            <p className="text-zinc-400 text-sm md:text-base">
              Find, join, and explore amazing buildathons
            </p>
          </div>
          <div className="flex flex-col sm:flex-row sm:flex-wrap gap-3">
            <Link href="/dashboard" className="w-full sm:w-auto">
              <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Plus size={18} className="mr-2" />
                Host Event
              </Button>
            </Link>
            {isAdmin && (
              <Link href="/admin/dashboard" className="w-full sm:w-auto">
                <Button variant="secondary" className="w-full">
                  <Settings size={18} className="mr-2" />
                  Admin
                </Button>
              </Link>
            )}
          </div>
        </div>

        {/* Discovery Filters */}
        <Card className="p-4 bg-zinc-900 border-zinc-800">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                placeholder="Search events or organizations..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-zinc-950 border border-zinc-800 rounded-md text-white focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
              />
            </div>
            <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              <Button 
                variant={statusFilter === 'all' ? 'primary' : 'ghost'} 
                onClick={() => setStatusFilter('all')}
                className="whitespace-nowrap"
              >
                All Events
              </Button>
              <Button 
                variant={statusFilter === 'active' ? 'primary' : 'ghost'} 
                onClick={() => setStatusFilter('active')}
                className="whitespace-nowrap"
              >
                Active
              </Button>
              <Button 
                variant={statusFilter === 'upcoming' ? 'primary' : 'ghost'} 
                onClick={() => setStatusFilter('upcoming')}
                className="whitespace-nowrap"
              >
                Upcoming
              </Button>
              <Button 
                variant={statusFilter === 'archived' ? 'primary' : 'ghost'} 
                onClick={() => setStatusFilter('archived')}
                className="whitespace-nowrap"
              >
                Archived
              </Button>
            </div>
          </div>
        </Card>
      </header>

      {isLoading ? (
        <div className="min-h-[40vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <Search size={48} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No events found</h2>
          <p className="text-zinc-400 mb-4">
            {searchQuery 
              ? "We couldn't find any events matching your search." 
              : "There are no events in this category right now."}
          </p>
          {(searchQuery || statusFilter !== 'all') && (
            <Button 
              variant="secondary" 
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Clear Filters
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Events - Prominent */}
          {activeEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Rocket size={20} className="text-emerald-500" />
                Active Buildathons
              </h2>
              <div className="grid gap-4 md:grid-cols-2">
                {activeEvents.map((event) => renderEventCard(event, true))}
              </div>
            </section>
          )}

          {/* Upcoming Events */}
          {upcomingEvents.length > 0 && (
            <section>
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Clock size={20} className="text-yellow-500" />
                Upcoming Buildathons
              </h2>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {upcomingEvents.map((event) => renderEventCard(event, false))}
              </div>
            </section>
          )}

          {/* Past Events */}
          {archivedEvents.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <Archive size={20} className="text-zinc-500" />
                  Past Buildathons
                </h2>
              </div>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {archivedEvents.map((event) => renderEventCard(event, false))}
              </div>
            </section>
          )}
        </div>
      )}
    </div>
  );
}
