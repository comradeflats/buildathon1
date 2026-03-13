'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, Trophy, Calendar } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTeams } from '@/context/TeamContext';
import { TeamCard } from '@/components/gallery/TeamCard';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MySubmissionsPage() {
  const { user, isAuthenticated, isAnonymous, isLoading: authLoading, ownershipToken } = useAuth();
  const { teams, isLoading: teamsLoading } = useTeams();

  const myTeams = useMemo(() => {
    if (!isAuthenticated && !ownershipToken) return [];

    return teams.filter((team) => {
      // For authenticated users
      if (user && !isAnonymous && team.ownerId === user.uid) {
        return true;
      }
      // For anonymous users with IndexedDB token
      if (ownershipToken && team.ownershipToken === ownershipToken) {
        return true;
      }
      return false;
    });
  }, [teams, user, isAnonymous, ownershipToken, isAuthenticated]);

  const isLoading = authLoading || teamsLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Home
      </Link>

      <h1 className="text-2xl font-bold text-white mb-2">My Submissions</h1>
      <p className="text-zinc-400 mb-6">
        Projects you've submitted to buildathon events.
      </p>

      {myTeams.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="w-20 h-20 bg-zinc-800/50 rounded-full flex items-center justify-center mx-auto mb-6 border border-zinc-700">
            <Trophy size={40} className="text-zinc-600" />
          </div>
          <h2 className="text-xl font-bold text-white mb-3">
            No Submissions Yet
          </h2>
          <p className="text-zinc-400 mb-8 max-w-sm mx-auto">
            You haven't submitted any projects yet. Join an active event to start building and share your work with the community!
          </p>
          <Link href="/events">
            <Button size="lg" className="px-8 font-bold">
              <Calendar size={18} className="mr-2" />
              Browse Events
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {myTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
