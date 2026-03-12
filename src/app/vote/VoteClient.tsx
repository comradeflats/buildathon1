'use client';

import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, Send } from 'lucide-react';
import { VotingForm } from '@/components/voting/VotingForm';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { useVoting } from '@/context/VotingContext';
import { useTeams } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { isTeamOwner, hasSubmittedToEvent } from '@/lib/ownership';

export default function VotePage() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { getTeamById, teams, isLoading } = useTeams();
  const { user, isAuthenticated, isLoading: authLoading, ownershipToken } = useAuth();
  const { getEventById } = useEvents();

  const team = teamId ? getTeamById(teamId) : null;
  const event = team ? getEventById(team.eventId) : null;
  const { isJudge, isAdmin, isOwner, isLoading: permsLoading } = useOrgPermissions(event?.organizationId || null);

  if (isLoading || authLoading || permsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

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

  // EXPERT JUDGING LOGIC
  if (event?.votingModel === 'expert') {
    if (!isJudge && !isAdmin && !isOwner) {
      return (
        <div className="max-w-2xl mx-auto py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </Link>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-red-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Expert Judging Only
            </h2>
            <p className="text-zinc-400 mb-6">
              This event uses an expert judging model. Only designated judges from the organization can vote.
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      );
    }
  } else {
    // PEER VOTING LOGIC
    // Check if user is trying to vote on their own project
    if (isTeamOwner(team, user, ownershipToken)) {
      return (
        <div className="max-w-2xl mx-auto py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </Link>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-amber-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Cannot Vote on Your Own Project
            </h2>
            <p className="text-zinc-400 mb-6">
              You submitted "{team.projectName}", so you cannot vote on it.
              Check out other projects to cast your votes!
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
            >
              Browse Other Projects
            </Link>
          </div>
        </div>
      );
    }

    // Check if user has submitted to the same event
    if (!hasSubmittedToEvent(teams, team.eventId, user, ownershipToken)) {
      return (
        <div className="max-w-2xl mx-auto py-10">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Projects
          </Link>
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
            <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <Send className="w-8 h-8 text-blue-500" />
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Submit a Project First
            </h2>
            <p className="text-zinc-400 mb-6">
              To vote on projects in this event, you must first submit your own project.
              This ensures fair voting among participants.
            </p>
            <Link
              href={`/submit?eventId=${team.eventId}`}
              className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
            >
              <Send size={18} />
              Submit Your Project
            </Link>
          </div>
        </div>
      );
    }
  }

  return <VotingForm team={team} />;
}
