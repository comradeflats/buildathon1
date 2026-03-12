'use client';

import { useMemo } from 'react';
import { TeamCard } from './TeamCard';
import { useVoting } from '@/context/VotingContext';
import { Loader2, LayoutGrid } from 'lucide-react';

interface TeamGalleryProps {
  eventId?: string;
}

export function TeamGallery({ eventId }: TeamGalleryProps) {
  const { teams, isLoading } = useVoting();

  const filteredTeams = useMemo(() => {
    if (!eventId) return teams;
    return teams.filter((team) => team.eventId === eventId);
  }, [teams, eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (filteredTeams.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
        <LayoutGrid className="mx-auto mb-4 opacity-20" size={48} />
        <p className="font-medium text-white">No teams found in this arena.</p>
        <p className="text-sm mt-1">Check back later or explore other arenas.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {filteredTeams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
