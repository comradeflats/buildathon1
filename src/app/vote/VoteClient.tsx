'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { VotingForm } from '@/components/voting/VotingForm';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { useVoting } from '@/context/VotingContext';
import { useAuth } from '@/context/AuthContext';

export default function VotePage() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { getTeamById, isLoading } = useVoting();
  const { isAuthenticated, isLoading: authLoading } = useAuth();

  if (isLoading || authLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  const team = teamId ? getTeamById(teamId) : null;

  if (!team) {
    return (
      <div className="max-w-2xl mx-auto text-center py-20">
        <h1 className="text-2xl font-bold text-white mb-4">Team Not Found</h1>
        <p className="text-zinc-400 mb-6">
          The team you're looking for doesn't exist or no ID was provided.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-accent hover:text-accent-hover transition-colors"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>
      </div>
    );
  }

  // Show sign-in prompt if not authenticated
  if (!isAuthenticated) {
    return (
      <div className="max-w-2xl mx-auto py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </Link>
        <SignInPrompt
          title="Sign in to Vote"
          description={`Sign in to submit your vote for "${team.projectName}". Your vote helps decide the winners.`}
        />
      </div>
    );
  }

  return <VotingForm team={team} />;
}
