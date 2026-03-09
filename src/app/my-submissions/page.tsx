'use client';

import { useMemo } from 'react';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertTriangle, Github, Plus } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useVoting } from '@/context/VotingContext';
import { TeamCard } from '@/components/gallery/TeamCard';
import { AuthButton } from '@/components/auth/AuthButton';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

export default function MySubmissionsPage() {
  const { user, isAuthenticated, isAnonymous, isLoading: authLoading, ownershipToken } = useAuth();
  const { teams, isLoading: teamsLoading } = useVoting();

  const myTeams = useMemo(() => {
    if (!isAuthenticated && !ownershipToken) return [];

    return teams.filter((team) => {
      // For GitHub-authenticated users
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

      {/* Warning for anonymous users */}
      {ownershipToken && !isAuthenticated && (
        <Card className="p-4 mb-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-500 mb-1">
                Browser-Only Access
              </h3>
              <p className="text-sm text-zinc-400 mb-3">
                Your submissions are linked to this browser. If you clear your browser data
                or use a different device, you'll lose access to edit them.
              </p>
              <AuthButton size="sm" />
            </div>
          </div>
        </Card>
      )}

      {/* Warning for anonymous Firebase users */}
      {isAuthenticated && isAnonymous && (
        <Card className="p-4 mb-6 border-yellow-500/30 bg-yellow-500/5">
          <div className="flex items-start gap-3">
            <AlertTriangle className="w-5 h-5 text-yellow-500 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h3 className="font-medium text-yellow-500 mb-1">
                Guest Account
              </h3>
              <p className="text-sm text-zinc-400 mb-3">
                You're signed in as a guest. Sign in with GitHub to access your submissions
                from any device and ensure you don't lose access.
              </p>
              <AuthButton size="sm" />
            </div>
          </div>
        </Card>
      )}

      {myTeams.length === 0 ? (
        <Card className="p-8 text-center">
          <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-4">
            <Github size={32} className="text-zinc-500" />
          </div>
          <h2 className="text-lg font-semibold text-white mb-2">
            No Submissions Yet
          </h2>
          <p className="text-zinc-400 mb-6">
            You haven't submitted any projects. Start by submitting your GitHub repository.
          </p>
          <Link href="/submit">
            <Button>
              <Plus size={18} className="mr-2" />
              Submit a Project
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {myTeams.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}
