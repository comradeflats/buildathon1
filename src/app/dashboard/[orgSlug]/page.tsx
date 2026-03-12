'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Calendar, Users, BarChart3, Plus, ArrowRight, Activity } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SetupWizard } from '@/components/admin/SetupWizard';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgEvents } from '@/hooks/useOrgEvents';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';

export default function OrgDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.orgSlug as string;

  const { user, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const [org, setOrg] = useState<any>(null);

  // Find organization by slug
  useEffect(() => {
    if (!orgsLoading && organizations.length > 0) {
      const foundOrg = organizations.find((o) => o.slug === slug);
      if (foundOrg) {
        setOrg(foundOrg);
      } else {
        // Organization not found or user doesn't have access
        router.push('/dashboard');
      }
    }
  }, [organizations, orgsLoading, slug, router]);

  const { events, isLoading: eventsLoading } = useOrgEvents(org?.id);
  const { permissions } = useOrgPermissions(org?.id);

  const isLoading = authLoading || orgsLoading || !org;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  // Calculate stats
  const activeEvent = events.find((e) => e.status === 'active');
  const hasThemes = events.some((e) => e.themesGenerated);
  const totalEvents = events.length;
  const totalApproved = events.reduce((acc, e) => acc + (e.currentRegistrations || 0), 0);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Organizations
          </Link>
          <span>/</span>
          <span className="text-white">{org.name}</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">{org.name}</h1>
            {org.description && (
              <p className="text-zinc-400">{org.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Link href={`/dashboard/${slug}/settings`}>
              <Button variant="ghost">Settings</Button>
            </Link>
            {permissions.canManageEvents && (
              <Link href={`/dashboard/${slug}/events/new`}>
                <Button>
                  <Plus size={18} className="mr-2" />
                  New Event
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Setup Wizard */}
      <SetupWizard 
        orgSlug={slug}
        hasEvents={events.length > 0}
        hasThemes={hasThemes}
        hasMembers={org.memberCount > 1}
      />

      {/* Live Event Activity */}
      {activeEvent && (
        <Card className="p-6 border-emerald-500/30 bg-emerald-500/5 backdrop-blur-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 p-4">
            <Badge variant="success" className="animate-pulse">Live Now</Badge>
          </div>
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <h2 className="text-sm font-bold text-emerald-500 uppercase tracking-widest flex items-center gap-2">
                <Activity size={16} />
                Active Event
              </h2>
              <h3 className="text-2xl font-black text-white">{activeEvent.name}</h3>
              <p className="text-zinc-400 text-sm max-w-md">
                Manage participants, monitor submissions, and oversee the build in real-time.
              </p>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="flex gap-4 pr-6 border-r border-zinc-800">
                <div className="text-center">
                  <p className="text-xl font-black text-white">{activeEvent.currentRegistrations || 0}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Participants</p>
                </div>
                <div className="text-center">
                  <p className="text-xl font-black text-white">{activeEvent.phase.replace('_', ' ')}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest">Current Phase</p>
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <Link href={`/dashboard/${slug}/events/${activeEvent.id}/participants`}>
                  <Button size="sm" className="w-full">
                    Manage Participants
                  </Button>
                </Link>
                <Link href={`/e/${activeEvent.slug}`} target="_blank">
                  <Button variant="ghost" size="sm" className="w-full text-zinc-400 hover:text-white">
                    <ArrowRight size={14} className="mr-2" />
                    Open Portal
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </Card>
      )}

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Total Events</span>
            <Calendar className="text-zinc-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{totalEvents}</div>
          <div className="text-sm text-zinc-500 mt-1">
            Buildathon history
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Participants</span>
            <Users className="text-zinc-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{totalApproved}</div>
          <div className="text-sm text-zinc-500 mt-1">
            Approved across all events
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-zinc-400">Organization Members</span>
            <BarChart3 className="text-zinc-500" size={20} />
          </div>
          <div className="text-3xl font-bold text-white">{org.memberCount}</div>
          <div className="text-sm text-zinc-500 mt-1">
            Admins & Judges
          </div>
        </Card>
      </div>

      {/* Recent Events */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Recent Events</h2>
          <Link href={`/dashboard/${slug}/events`} className="text-accent hover:underline text-sm">
            View all
          </Link>
        </div>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 size={24} className="animate-spin text-zinc-400" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-12 text-center">
            <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
            <h3 className="text-lg font-semibold text-white mb-2">No Events Yet</h3>
            <p className="text-zinc-400 mb-6">
              Create your first buildathon event to get started
            </p>
            {permissions.canManageEvents && (
              <Link href={`/dashboard/${slug}/events/new`}>
                <Button>
                  <Plus size={18} className="mr-2" />
                  Create Event
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="space-y-3">
            {events.slice(0, 5).map((event) => (
              <Card
                key={event.id}
                className="p-4 hover:border-zinc-600 transition-colors cursor-pointer group"
                onClick={() => router.push(`/e/${event.slug}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
                        {event.name}
                      </h3>
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
                      <p className="text-sm text-zinc-400 line-clamp-1">
                        {event.description}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-4">
                    {permissions.canManageEvents && (
                      <Link
                        href={`/dashboard/${slug}/events/${event.id}`}
                        onClick={(e) => e.stopPropagation()}
                        className="text-sm text-zinc-400 hover:text-accent transition-colors"
                      >
                        Manage
                      </Link>
                    )}
                    <ArrowRight size={20} className="text-zinc-600 group-hover:text-accent transition-colors" />
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid gap-3 md:grid-cols-2">
          <Link href={`/dashboard/${slug}/events`}>
            <Card className="p-4 hover:border-zinc-600 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Calendar className="text-accent" size={20} />
                  </div>
                  <span className="font-medium text-white group-hover:text-accent transition-colors">
                    Manage Events
                  </span>
                </div>
                <ArrowRight size={20} className="text-zinc-600 group-hover:text-accent transition-colors" />
              </div>
            </Card>
          </Link>

          <Link href={`/dashboard/${slug}/members`}>
            <Card className="p-4 hover:border-zinc-600 transition-colors cursor-pointer group">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Users className="text-accent" size={20} />
                  </div>
                  <span className="font-medium text-white group-hover:text-accent transition-colors">
                    Team Members
                  </span>
                </div>
                <ArrowRight size={20} className="text-zinc-600 group-hover:text-accent transition-colors" />
              </div>
            </Card>
          </Link>
        </div>
      </div>
    </div>
  );
}
