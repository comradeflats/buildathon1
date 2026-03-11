'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Calendar, Users, Loader2, Plus, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';
import { useThemes } from '@/hooks/useThemes';
import { getThemeEmoji } from '@/lib/themeIcons';

export default function EventPage() {
  const params = useParams();
  const eventId = params.id as string;

  const { events, isLoading: isEventsLoading, getEventById } = useEvents();
  const { teams, isLoading: isTeamsLoading } = useTeams();
  const { themes, isLoading: isThemesLoading } = useThemes();

  const isLoading = isEventsLoading || isTeamsLoading || isThemesLoading;

  const event = getEventById(eventId);
  const eventTeams = teams.filter((team) => team.eventId === eventId);
  const eventThemes = themes.filter((theme) => theme.eventId === eventId);

  const formatEventDates = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-GB')} – ${end.toLocaleDateString('en-GB')}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB');
    const timeStr = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr}, ${timeStr}`;
  };

  const canSubmit = event?.status === 'active' || event?.status === 'upcoming';

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Calendar size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Event Not Found</h2>
        <p className="text-zinc-400 mb-6">
          The event you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/"
          className="text-accent hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>
    );
  }

  const dateRange = formatEventDates(event.startDate, event.endDate);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>

        <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-bold text-white">{event.name}</h1>
              <Badge
                variant={
                  event.status === 'active'
                    ? 'success'
                    : event.status === 'upcoming'
                    ? 'default'
                    : 'secondary'
                }
                className="capitalize"
              >
                {event.status}
              </Badge>
            </div>
            {event.description && (
              <p className="text-zinc-400 mb-2">{event.description}</p>
            )}
            <div className="text-zinc-400 flex flex-wrap items-center gap-4 text-sm">
              {dateRange && (
                <span className="flex items-center gap-1">
                  <Calendar size={14} />
                  {dateRange}
                </span>
              )}
              {event.submissionDeadline && (
                <span className="flex items-center gap-1">
                  <Clock size={14} />
                  Submissions due: {formatDateTime(event.submissionDeadline)}
                </span>
              )}
              <span className="flex items-center gap-1">
                <Users size={14} />
                {eventTeams.length} {eventTeams.length === 1 ? 'project' : 'projects'}
              </span>
            </div>
          </div>

          {canSubmit && (
            <Link href={`/submit?eventId=${eventId}`}>
              <Button size="lg" className="shrink-0">
                <Plus size={18} className="mr-2" />
                Submit Project
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Themes for this event */}
      {eventThemes.length > 0 && (
        <Card className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">Themes</h2>
            <span className="text-sm text-zinc-500">{eventThemes.length} themes available</span>
          </div>

          {/* Shared Judging Criteria Section */}
          {eventThemes[0]?.judgingCriteria && eventThemes[0].judgingCriteria.length > 0 && (
            <div className="mb-6 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/30">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-3">
                Judging Criteria
              </p>
              <div className="flex flex-col gap-2">
                {eventThemes[0].judgingCriteria.map((criterion, index) => (
                  <span key={index} className="text-sm text-zinc-300 flex items-center gap-1.5">
                    <span className="text-accent font-medium">{index + 1}.</span>
                    {criterion}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Theme Cards Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {eventThemes.map((theme) => (
              <div
                key={theme.id}
                className="p-5 bg-zinc-800/50 rounded-lg border border-zinc-700/50 hover:border-zinc-600 hover:bg-zinc-800/70 transition-all text-center flex flex-col"
              >
                <div className="text-4xl mb-3">
                  {getThemeEmoji(theme)}
                </div>
                <h3 className="font-semibold text-white mb-2">{theme.name}</h3>
                <p className="text-sm text-zinc-400 mb-4 flex-1">{theme.concept}</p>

                {canSubmit && (
                  <Link href={`/submit?eventId=${eventId}&themeId=${theme.id}`} className="block">
                    <Button variant="secondary" size="sm" className="w-full">
                      Submit
                    </Button>
                  </Link>
                )}
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* View Submissions Link */}
      {eventTeams.length > 0 && (
        <div className="flex justify-center">
          <Link href={`/gallery?eventId=${eventId}`}>
            <Button variant="secondary" size="lg">
              View Submissions in Gallery
            </Button>
          </Link>
        </div>
      )}
    </div>
  );
}
