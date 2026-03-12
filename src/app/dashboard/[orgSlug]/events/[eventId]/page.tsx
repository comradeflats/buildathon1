'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, ExternalLink, Users, BarChart3, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useEvents } from '@/hooks/useEvents';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { useTeams } from '@/hooks/useTeams';
import { useThemes } from '@/hooks/useThemes';
import { ThemeManager } from '@/components/admin/ThemeManager';

export default function ManageEventPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const eventId = params.eventId as string;

  const { user, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const { getEventById, isLoading: isEventsLoading } = useEvents();
  const { teams } = useTeams();
  const { themes, getThemesByEventId } = useThemes();

  const [org, setOrg] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);

  // Find organization by slug
  useEffect(() => {
    if (!orgsLoading && organizations.length > 0) {
      const foundOrg = organizations.find((o) => o.slug === orgSlug);
      if (foundOrg) {
        setOrg(foundOrg);
      } else {
        router.push('/dashboard');
      }
    }
  }, [organizations, orgsLoading, orgSlug, router]);

  // Get event
  useEffect(() => {
    if (!isEventsLoading && eventId) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        // Verify event belongs to org
        if (org && foundEvent.organizationId !== org.id) {
          router.push(`/dashboard/${orgSlug}/events`);
        } else {
          setEvent(foundEvent);
        }
      }
    }
  }, [eventId, getEventById, org, orgSlug, router, isEventsLoading]);

  const { permissions, isLoading: permsLoading, orgId: fetchedOrgId } = useOrgPermissions(org?.id);

  const isLoading = authLoading || orgsLoading || permsLoading || isEventsLoading || !org || !event;

  // Redirect if not authenticated or no permissions
  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (org && !permsLoading && fetchedOrgId === org.id && !permissions.canManageEvents) {
      router.push(`/dashboard/${orgSlug}`);
    }
  }, [permissions, permsLoading, org, orgSlug, router, fetchedOrgId]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  const eventTeams = teams.filter((t) => t.eventId === eventId);
  const eventThemes = getThemesByEventId(eventId);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/${orgSlug}/events`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
        <div className="flex items-start justify-between">
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
              <p className="text-zinc-400">{event.description}</p>
            )}
          </div>
          <Link href={`/e/${event.slug}`} target="_blank">
            <Button variant="secondary">
              View Public Page
              <ExternalLink size={16} className="ml-2" />
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Submissions</span>
            <Users className="text-zinc-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{eventTeams.length}</div>
          <div className="text-sm text-zinc-500 mt-1">
            Total projects submitted
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Themes</span>
            <BarChart3 className="text-zinc-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{eventThemes.length}</div>
          <div className="text-sm text-zinc-500 mt-1">
            Available themes
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Dates</span>
            <Calendar className="text-zinc-500" size={20} />
          </div>
          <div className="text-sm font-medium text-white">
            {event.startDate && new Date(event.startDate).toLocaleDateString('en-GB')}
          </div>
          <div className="text-sm text-zinc-500 mt-1">
            {event.endDate && `Until ${new Date(event.endDate).toLocaleDateString('en-GB')}`}
          </div>
        </Card>
      </div>

      {/* Event Details */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Event Details</h2>
        <div className="space-y-4">
          <div>
            <label className="text-sm text-zinc-500">Public URL</label>
            <div className="flex items-center gap-2 mt-1">
              <code className="text-sm text-white bg-zinc-800 px-3 py-2 rounded flex-1">
                buildathon.live/e/{event.slug}
              </code>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  navigator.clipboard.writeText(`https://buildathon.live/e/${event.slug}`);
                }}
              >
                Copy
              </Button>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm text-zinc-500">Start Date</label>
              <p className="text-white mt-1">
                {event.startDate && new Date(event.startDate).toLocaleString('en-GB')}
              </p>
            </div>
            <div>
              <label className="text-sm text-zinc-500">End Date</label>
              <p className="text-white mt-1">
                {event.endDate && new Date(event.endDate).toLocaleString('en-GB')}
              </p>
            </div>
          </div>

          {event.submissionDeadline && (
            <div>
              <label className="text-sm text-zinc-500">Submission Deadline</label>
              <p className="text-white mt-1">
                {new Date(event.submissionDeadline).toLocaleString('en-GB')}
              </p>
            </div>
          )}

          <div>
            <label className="text-sm text-zinc-500">Visibility</label>
            <p className="text-white mt-1 capitalize">{event.visibility || 'public'}</p>
          </div>
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid gap-3 md:grid-cols-3">
        <Link href={`/e/${event.slug}/gallery`} target="_blank">
          <Button variant="secondary" className="w-full">
            View Gallery
          </Button>
        </Link>
        <Link href={`/e/${event.slug}/leaderboard`} target="_blank">
          <Button variant="secondary" className="w-full">
            View Leaderboard
          </Button>
        </Link>
        <Link href={`/e/${event.slug}/submit`} target="_blank">
          <Button variant="secondary" className="w-full">
            Submit Project
          </Button>
        </Link>
      </div>

      {/* Theme Management */}
      <ThemeManager eventId={eventId} organizationId={org.id} />

      {/* Note */}
      <div className="text-center text-sm text-zinc-500 pb-12">
        <p>Full event editing capabilities coming soon</p>
      </div>
    </div>
  );
}
