'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { GitHubSubmissionForm } from '@/components/submit/GitHubSubmissionForm';
import { useVoting } from '@/context/VotingContext';
import { Loader2 } from 'lucide-react';

function SubmitPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const { getTeamById } = useVoting();
  
  const teamToEdit = teamId ? getTeamById(teamId) : undefined;

  return (
    <div className="max-w-3xl mx-auto">
      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {teamToEdit ? 'Edit Project Submission' : 'Submit Your Project'}
        </h1>
        <p className="text-zinc-400">
          {teamToEdit 
            ? `Update details for ${teamToEdit.projectName}` 
            : 'Enter your GitHub repository to pull project details automatically.'}
        </p>
      </header>

      <GitHubSubmissionForm initialTeam={teamToEdit} />
    </div>
  );
}

export default function SubmitPage() {
  return (
    <Suspense 
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <SubmitPageContent />
    </Suspense>
  );
}
