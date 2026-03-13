'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { 
  Loader2, 
  Search, 
  Map as MapIcon, 
  Activity, 
  Zap, 
  History, 
  Filter, 
  ChevronDown, 
  MapPin, 
  ArrowRight,
  Users,
  Trophy
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useEvents } from '@/hooks/useEvents';
import { getEventStatus } from '@/lib/utils';

// Load map dynamically to avoid SSR window errors
const RegionalMap = dynamic(() => import('@/components/events/RegionalMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] bg-zinc-900 animate-pulse rounded-2xl flex items-center justify-center border border-zinc-800">
      <Loader2 size={32} className="animate-spin text-zinc-700" />
    </div>
  )
});

const REGIONS = [
  'All Regions',
  'SE Asia',
  'East Asia',
  'South Asia',
  'Europe',
  'North America',
  'South America',
  'Africa',
  'Oceania',
  'Middle East',
  'Remote'
];

function ExploreArenas() {
  const { events, isLoading } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState('All Regions');
  const [expandedSections, setExpandedSections] = useState({
    active: true,
    upcoming: true,
    archived: false
  });

  const toggleSection = (section: keyof typeof expandedSections) => {
    setExpandedSections(prev => ({ ...prev, [section]: !prev[section] }));
  };

  // Filter events based on search query and region
  const filteredEvents = useMemo(() => {
    return events.filter(e => {
      const matchesSearch = !searchQuery || 
        e.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        e.location?.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesRegion = selectedRegion === 'All Regions' || e.region === selectedRegion;
      
      return matchesSearch && matchesRegion;
    });
  }, [events, searchQuery, selectedRegion]);

  // Categorize filtered events using derived status
  const categorized = useMemo(() => {
    const processed = filteredEvents.map(e => ({
      ...e,
      derivedStatus: getEventStatus(e.startDate, e.endDate)
    }));

    return {
      active: processed.filter(e => e.derivedStatus === 'active'),
      upcoming: processed.filter(e => e.derivedStatus === 'upcoming'),
      archived: processed.filter(e => e.derivedStatus === 'archived'),
    };
  }, [filteredEvents]);

  // Map events should only be Active and Upcoming
  const mapEvents = useMemo(() => {
    return filteredEvents.filter(e => {
      const status = getEventStatus(e.startDate, e.endDate);
      return status === 'active' || status === 'upcoming';
    });
  }, [filteredEvents]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-12 pb-20 px-4">
      {/* Header & Global Filters */}
      <div className="flex flex-col space-y-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="text-5xl font-black text-white tracking-tight">
              Arena <span className="text-emerald-400">Explorer</span>
            </h1>
            <p className="text-zinc-500 font-medium">
              Discover and join live building experiences across global locations.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative min-w-[240px]">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search city or event..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            
            <div className="relative min-w-[180px]">
              <Filter size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <select
                value={selectedRegion}
                onChange={(e) => setSelectedRegion(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white appearance-none focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
              >
                {REGIONS.map(r => <option key={r} value={r}>{r}</option>)}
              </select>
              <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 pointer-events-none" />
            </div>
          </div>
        </div>

        {/* Map View - Secondary Visual */}
        <section className="relative group overflow-hidden rounded-[2.5rem] border border-zinc-800 bg-zinc-950 shadow-2xl">
          <div className="absolute top-4 left-4 z-10">
            <Badge className="bg-zinc-900/80 backdrop-blur-md border-zinc-700 text-zinc-400 py-1.5 px-4 flex items-center gap-2">
              <MapIcon size={14} className="text-emerald-500" />
              {categorized.active.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  {categorized.active.length} Live {categorized.active.length === 1 ? 'Arena' : 'Arenas'}
                </span>
              )}
              {categorized.active.length > 0 && categorized.upcoming.length > 0 && <span className="text-zinc-700">•</span>}
              {categorized.upcoming.length > 0 && (
                <span className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-violet-500" />
                  {categorized.upcoming.length} Upcoming {categorized.upcoming.length === 1 ? 'Sprint' : 'Sprints'}
                </span>
              )}
              {categorized.active.length === 0 && categorized.upcoming.length === 0 && (
                <span>No Active or Upcoming Arenas</span>
              )}
            </Badge>
          </div>
          <div className="h-[400px]">
            <RegionalMap events={mapEvents} />
          </div>
        </section>
      </div>

      {/* Grouped Content */}
      <div className="space-y-16">
        {/* 1. LIVE NOW */}
        <section className="space-y-6">
          <button 
            onClick={() => toggleSection('active')}
            className="flex items-center gap-4 group w-full text-left"
          >
            <div className="w-12 h-12 bg-emerald-500/10 rounded-2xl flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:bg-emerald-500/20 transition-all">
              <Activity size={24} className="animate-pulse" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white">Live Now</h2>
                <Badge className="bg-emerald-500 text-zinc-950 font-black px-2 py-0.5 animate-bounce">
                  {categorized.active.length}
                </Badge>
              </div>
              <p className="text-zinc-500 text-sm font-medium">Events currently in progress</p>
            </div>
            <ChevronDown size={24} className={`text-zinc-700 transition-transform duration-300 ${expandedSections.active ? '' : '-rotate-90'}`} />
          </button>

          {expandedSections.active && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-4">
              {categorized.active.length === 0 ? (
                <EmptyState message="No live arenas in this region right now." />
              ) : (
                categorized.active.map(event => <EventCard key={event.id} event={event} />)
              )}
            </div>
          )}
        </section>

        {/* 2. UPCOMING */}
        <section className="space-y-6">
          <button 
            onClick={() => toggleSection('upcoming')}
            className="flex items-center gap-4 group w-full text-left"
          >
            <div className="w-12 h-12 bg-violet-500/10 rounded-2xl flex items-center justify-center text-violet-500 border border-violet-500/20 group-hover:bg-violet-500/20 transition-all">
              <Zap size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white">Upcoming Sprints</h2>
                <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700 px-2 py-0.5">
                  {categorized.upcoming.length}
                </Badge>
              </div>
              <p className="text-zinc-500 text-sm font-medium">Join these soon to enter the arena</p>
            </div>
            <ChevronDown size={24} className={`text-zinc-700 transition-transform duration-300 ${expandedSections.upcoming ? '' : '-rotate-90'}`} />
          </button>

          {expandedSections.upcoming && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-4">
              {categorized.upcoming.length === 0 ? (
                <EmptyState message="No upcoming sprints scheduled here yet." />
              ) : (
                categorized.upcoming.map(event => <EventCard key={event.id} event={event} />)
              )}
            </div>
          )}
        </section>

        {/* 3. PAST ARENAS (Collapsible) */}
        <section className="space-y-6">
          <button 
            onClick={() => toggleSection('archived')}
            className="flex items-center gap-4 group w-full text-left"
          >
            <div className="w-12 h-12 bg-zinc-800 rounded-2xl flex items-center justify-center text-zinc-500 border border-zinc-700 group-hover:bg-zinc-700 transition-all">
              <History size={24} />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-3">
                <h2 className="text-3xl font-black text-white opacity-60">Past Arenas</h2>
                <Badge className="bg-zinc-900 text-zinc-600 border-zinc-800 px-2 py-0.5">
                  {categorized.archived.length}
                </Badge>
              </div>
              <p className="text-zinc-500 text-sm font-medium">Relive the builds and results</p>
            </div>
            <ChevronDown size={24} className={`text-zinc-700 transition-transform duration-300 ${expandedSections.archived ? '' : '-rotate-90'}`} />
          </button>

          {expandedSections.archived && (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-top-4">
              {categorized.archived.length === 0 ? (
                <EmptyState message="No history found for this selection." />
              ) : (
                categorized.archived.map(event => <EventCard key={event.id} event={event} />)
              )}
            </div>
          )}
        </section>
      </div>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="col-span-full py-16 text-center border-2 border-dashed border-zinc-900 rounded-[2rem] bg-zinc-950/30">
      <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">{message}</p>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const status = getEventStatus(event.startDate, event.endDate);
  const isUpcoming = status === 'upcoming';
  const isActive = status === 'active';
  
  return (
    <Card className="p-6 hover:border-emerald-500/30 transition-all group flex flex-col h-full bg-zinc-900/20 backdrop-blur-sm border-zinc-800/50 rounded-[2rem]">
      <div className="flex items-start justify-between mb-4">
        <div className="flex flex-col gap-2">
          <Badge variant="outline" className={`
            ${isActive ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
              isUpcoming ? 'border-violet-500/30 text-violet-400 bg-violet-500/5' : 
              'border-zinc-700 text-zinc-500'}
          `}>
            {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />}
            {status.toUpperCase()}
          </Badge>
          {isActive && event.phase && (
            <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[9px] font-black uppercase tracking-tighter w-fit">
              {event.phase.replace('_', ' ')}
            </Badge>
          )}
        </div>
        <div className="text-zinc-500 flex flex-col items-end gap-1 text-[10px] font-black uppercase tracking-widest">
          <span>{new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          {event.votingModel && (
            <span className="text-zinc-600 flex items-center gap-1">
              <Trophy size={10} />
              {event.votingModel} judging
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 space-y-3">
        <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
          {event.name}
        </h3>
        <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed font-medium">
          {event.description}
        </p>

        {/* Feature Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-zinc-900/50 border border-zinc-800 text-[10px] font-bold text-zinc-400">
             <Users size={12} className="text-emerald-500/50" />
             {event.currentRegistrations || 0} {event.maxParticipants ? `/ ${event.maxParticipants}` : 'Joined'}
          </div>
          {event.isRegistrationOpen && (
            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/5 border border-emerald-500/10 text-[10px] font-bold text-emerald-400">
               <div className="w-1 h-1 rounded-full bg-emerald-400 animate-ping" />
               OPEN
            </div>
          )}
        </div>
      </div>

      <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between mt-6">
        <div className="flex flex-col gap-1">
          <div className="flex items-center gap-2 text-white text-sm font-bold">
            <MapPin size={14} className="text-emerald-500" />
            {event.location}
          </div>
          <span className="text-[10px] text-zinc-500 font-black uppercase tracking-widest ml-5">{event.region}</span>
        </div>
        <Link href={`/events/${event.id}`}>
          <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:bg-emerald-500 group-hover:text-zinc-950 transition-all shadow-lg">
            <ArrowRight size={18} />
          </div>
        </Link>
      </div>
    </Card>
  );
}

export default function EventsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    }>
      <ExploreArenas />
    </Suspense>
  );
}
