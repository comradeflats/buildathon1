'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { ProjectSubmissionForm } from '@/components/submit/ProjectSubmissionForm';
import { useVoting } from '@/context/VotingContext';
import { useEvents } from '@/hooks/useEvents';
import { Loader2 } from 'lucide-react';

function SubmitPageContent() {
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const eventId = searchParams.get('eventId');
  const themeId = searchParams.get('themeId');

  const { getTeamById } = useVoting();
  const { getEventById } = useEvents();

  const teamToEdit = teamId ? getTeamById(teamId) : undefined;
  const preselectedEvent = eventId ? getEventById(eventId) : undefined;

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link - goes to event page if we came from one */}
      {eventId && !teamToEdit && (
        <Link
          href={`/events/${eventId}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to {preselectedEvent?.name || 'Event'}
        </Link>
      )}

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {teamToEdit ? 'Edit Project Submission' : 'Submit Your Project'}
        </h1>
        <p className="text-zinc-400">
          {teamToEdit
            ? `Update details for ${teamToEdit.projectName}`
            : preselectedEvent
              ? `Submitting to ${preselectedEvent.name}`
              : 'Share your project via GitHub, a live demo, or any link'}
        </p>
      </header>

      <ProjectSubmissionForm
        initialTeam={teamToEdit}
        preselectedEventId={eventId || undefined}
        preselectedThemeId={themeId || undefined}
      />
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
