'use client';

import dynamic from 'next/dynamic';
import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { ChevronRight, Loader2, Search, Map as MapIcon, Calendar, Clock, Trophy, LayoutGrid, Building2, ArrowRight, MapPin, Globe } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/lib/types';
import { getEventStatus } from '@/lib/utils';

// Load map dynamically to avoid SSR window errors
const RegionalMap = dynamic(() => import('@/components/events/RegionalMap'), { 
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] bg-zinc-900 animate-pulse rounded-2xl flex items-center justify-center border border-zinc-800">
      <Loader2 size={32} className="animate-spin text-zinc-700" />
    </div>
  )
});

type FilterStatus = 'active' | 'upcoming' | 'archived';

function ExploreArenas() {
  const { events, isLoading } = useEvents();
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<FilterStatus>('active');

  // Filter events based on search query (City or Event Name)
  const filteredEvents = useMemo(() => {
    if (!searchQuery) return events;
    const query = searchQuery.toLowerCase();
    return events.filter(e => 
      e.name.toLowerCase().includes(query) || 
      e.location?.toLowerCase().includes(query)
    );
  }, [events, searchQuery]);

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

  const currentList = categorized[activeTab];
  const hasResults = filteredEvents.length > 0;
  const isSearching = searchQuery.length > 0;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-12 pb-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Badge variant="outline" className="mb-3 border-emerald-500/30 text-emerald-400 bg-emerald-500/5">
            <Globe size={14} className="mr-2" />
            Discovery Hub
          </Badge>
          <h1 className="text-4xl font-black text-white tracking-tight">
            Explore the <span className="text-transparent bg-gradient-to-r from-emerald-400 to-violet-400 bg-clip-text">Arenas</span>
          </h1>
          <p className="text-zinc-400 mt-2 max-w-xl font-medium">
            Discover in-person buildathons across the globe. Select an arena to view live projects and winning teams.
          </p>
        </div>

        <div className="relative min-w-[300px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            placeholder="Search city or event..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-900 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-600 focus:outline-none focus:border-emerald-500 transition-colors shadow-2xl"
          />
        </div>
      </div>

      {/* Map View */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
           <div className="flex items-center gap-2 text-zinc-400 text-sm font-bold uppercase tracking-widest">
            <MapIcon size={18} className="text-emerald-400" />
            Live Arena Map
          </div>
          <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest hidden sm:block">
            {filteredEvents.length} Points of interest found
          </p>
        </div>
        <RegionalMap events={filteredEvents} />
      </section>

      {/* Sequential List Controls */}
      <div className="space-y-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 border-b border-zinc-900 pb-6">
           <div className="flex p-1 bg-zinc-950 border border-zinc-800 rounded-xl">
             <button
               onClick={() => setActiveTab('active')}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'active' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <div className={`w-2 h-2 rounded-full ${activeTab === 'active' ? 'bg-emerald-500 animate-pulse' : 'bg-zinc-700'}`} />
               Live Now
             </button>
             <button
               onClick={() => setActiveTab('upcoming')}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'upcoming' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <div className={`w-2 h-2 rounded-full ${activeTab === 'upcoming' ? 'bg-violet-500' : 'bg-zinc-700'}`} />
               Upcoming
             </button>
             <button
               onClick={() => setActiveTab('archived')}
               className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${activeTab === 'archived' ? 'bg-zinc-800 text-white shadow-lg' : 'text-zinc-500 hover:text-zinc-300'}`}
             >
               <div className={`w-2 h-2 rounded-full bg-zinc-600`} />
               Past Sprints
             </button>
           </div>

           <p className="text-xs text-zinc-500 font-medium">
             Showing {currentList.length} arenas in this category
           </p>
        </div>

        {!hasResults && isSearching ? (
          <Card className="p-12 text-center border-dashed border-zinc-800 bg-zinc-950/50 backdrop-blur-sm">
            <div className="w-16 h-16 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <Building2 className="text-emerald-400" size={32} />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">No arenas found in "{searchQuery}"</h2>
            <p className="text-zinc-400 max-w-md mx-auto mb-8">
              Be the first to bring the buildathon energy to this location.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup">
                <Button className="bg-white text-zinc-950 font-bold px-8 rounded-full">
                  HOST A BUILDATHON
                </Button>
              </Link>
              <Button 
                variant="ghost" 
                onClick={() => setSearchQuery('')}
                className="text-zinc-400 hover:text-white"
              >
                Clear Search
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 animate-in fade-in slide-in-from-bottom-2 duration-500">
            {currentList.length === 0 ? (
              <div className="col-span-full py-20 text-center text-zinc-600 italic">
                No {activeTab} arenas to show at the moment.
              </div>
            ) : (
              currentList.map(event => (
                <EventCard key={event.id} event={event} />
              ))
            )}
          </div>
        )}

        {/* Global Host CTA */}
        <section className="mt-20 pt-12 border-t border-zinc-900">
          <Card className="p-8 md:p-12 bg-gradient-to-br from-zinc-900 to-zinc-950 border-zinc-800 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/5 blur-[100px] -z-10 group-hover:bg-emerald-500/10 transition-colors" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <h2 className="text-3xl font-black text-white">Don't see your city?</h2>
                <p className="text-zinc-400 max-w-lg text-lg">
                  Be the one to bring the buildathon energy to your local community. We provide the portal, you provide the arena.
                </p>
              </div>
              <Link href="/signup">
                <Button size="lg" className="rounded-full px-10 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black h-14 shadow-lg shadow-emerald-500/20 transition-all hover:scale-105 active:scale-95">
                  HOST A BUILDATHON
                </Button>
              </Link>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
}

function EventCard({ event }: { event: any }) {
  const status = getEventStatus(event.startDate, event.endDate);
  const isUpcoming = status === 'upcoming';
  const isActive = status === 'active';
  
  return (
    <Card className="p-6 hover:border-emerald-500/30 transition-all group flex flex-col h-full bg-zinc-900/40 backdrop-blur-sm border-zinc-800/50">
      <div className="flex items-start justify-between mb-4">
        <Badge variant="outline" className={`
          ${isActive ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
            isUpcoming ? 'border-violet-500/30 text-violet-400 bg-violet-500/5' : 
            'border-zinc-700 text-zinc-500'}
        `}>
          {isActive && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />}
          {status.toUpperCase()}
        </Badge>
        <div className="text-zinc-500 flex items-center gap-1 text-xs font-medium">
          <Calendar size={12} className="text-zinc-600" />
          {new Date(event.startDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
        </div>
      </div>

      <div className="flex-1 space-y-2">
        <h3 className="text-xl font-bold text-white group-hover:text-emerald-400 transition-colors">
          {event.name}
        </h3>
        <p className="text-zinc-500 text-sm line-clamp-2 leading-relaxed">
          {event.description}
        </p>
      </div>

      <div className="pt-6 border-t border-zinc-800/50 flex items-center justify-between mt-6">
        <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
          <MapPin size={14} className="text-violet-400" />
          {event.location}
        </div>
        <Link href={`/gallery/${event.id}`}>
          <Button variant="ghost" size="sm" className="text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10 p-0 h-auto font-bold tracking-tight">
            EXPLORE
            <ArrowRight size={14} className="ml-1 group-hover:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}

export default function GalleryPage() {
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
