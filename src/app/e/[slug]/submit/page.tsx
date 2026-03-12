'use client';

import { Suspense } from 'react';
import { useSearchParams, useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2 } from 'lucide-react';
import { ProjectSubmissionForm } from '@/components/submit/ProjectSubmissionForm';
import { useTeams } from '@/context/TeamContext';
import { useEventBySlug } from '@/hooks/useEventBySlug';

function SubmitBySlugContent() {
  const params = useParams();
  const searchParams = useSearchParams();
  const slug = params.slug as string;

  const teamId = searchParams.get('teamId');
  const themeId = searchParams.get('themeId');

  const { getTeamById } = useTeams();
  const { event, isLoading } = useEventBySlug(slug);

  const teamToEdit = teamId ? getTeamById(teamId) : undefined;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="max-w-3xl mx-auto text-center py-20">
        <h2 className="text-xl font-semibold text-white mb-2">Event Not Found</h2>
        <p className="text-zinc-400 mb-6">
          The event you&apos;re trying to submit to doesn&apos;t exist.
        </p>
        <Link href="/" className="text-accent hover:underline">
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Back link */}
      {!teamToEdit && (
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
        >
          <ArrowLeft size={16} />
          Back to {event.name}
        </Link>
      )}

      <header className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-white mb-2">
          {teamToEdit ? 'Edit Project Submission' : 'Submit Your Project'}
        </h1>
        <p className="text-zinc-400">
          {teamToEdit
            ? `Update details for ${teamToEdit.projectName}`
            : `Submitting to ${event.name}`}
        </p>
      </header>

      <ProjectSubmissionForm
        initialTeam={teamToEdit}
        preselectedEventId={event.id}
        preselectedThemeId={themeId || undefined}
      />
    </div>
  );
}

export default function SubmitBySlugPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-accent" />
        </div>
      }
    >
      <SubmitBySlugContent />
    </Suspense>
  );
}
