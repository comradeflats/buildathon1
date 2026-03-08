'use client';

import { TeamCard } from './TeamCard';
import { useVoting } from '@/context/VotingContext';
import { Loader2 } from 'lucide-react';

export function TeamGallery() {
  const { teams, isLoading } = useVoting();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (teams.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-400">
        <p>No teams found.</p>
        <p className="text-sm mt-2">Add teams to public/teams.json to get started.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <TeamCard key={team.id} team={team} />
      ))}
    </div>
  );
}
