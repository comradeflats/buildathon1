'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Calendar, Plus, ArrowRight, Filter } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgEvents } from '@/hooks/useOrgEvents';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { Event } from '@/lib/types';

export default function EventsListPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.orgSlug as string;

  const { user, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const [org, setOrg] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Find organization by slug
  useEffect(() => {
    if (!orgsLoading && organizations.length > 0) {
      const foundOrg = organizations.find((o) => o.slug === slug);
      if (foundOrg) {
        setOrg(foundOrg);
      } else {
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

  // Filter events
  const filteredEvents = events.filter((event) => {
    if (statusFilter === 'all') return true;
    return event.status === statusFilter;
  });

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link href="/dashboard" className="hover:text-white transition-colors">
            Organizations
          </Link>
          <span>/</span>
          <Link href={`/dashboard/${slug}`} className="hover:text-white transition-colors">
            {org.name}
          </Link>
          <span>/</span>
          <span className="text-white">Events</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Events</h1>
            <p className="text-zinc-400">
              Manage your buildathon events
            </p>
          </div>
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

      {/* Filters */}
      <Card className="p-4">
        <div className="flex items-center gap-4">
          <Filter size={18} className="text-zinc-500" />
          <div className="flex items-center gap-2">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                statusFilter === 'all'
                  ? 'bg-accent text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              All
            </button>
            <button
              onClick={() => setStatusFilter('active')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                statusFilter === 'active'
                  ? 'bg-accent text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Active
            </button>
            <button
              onClick={() => setStatusFilter('upcoming')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                statusFilter === 'upcoming'
                  ? 'bg-accent text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setStatusFilter('archived')}
              className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                statusFilter === 'archived'
                  ? 'bg-accent text-white'
                  : 'bg-zinc-800 text-zinc-400 hover:text-white'
              }`}
            >
              Archived
            </button>
          </div>
        </div>
      </Card>

      {/* Events List */}
      {eventsLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 size={24} className="animate-spin text-zinc-400" />
        </div>
      ) : filteredEvents.length === 0 ? (
        <Card className="p-12 text-center">
          <Calendar size={48} className="mx-auto text-zinc-600 mb-4" />
          <h3 className="text-lg font-semibold text-white mb-2">
            {statusFilter === 'all' ? 'No Events Yet' : `No ${statusFilter} events`}
          </h3>
          <p className="text-zinc-400 mb-6">
            {statusFilter === 'all'
              ? 'Create your first buildathon event to get started'
              : 'Try changing the filter to see other events'}
          </p>
          {permissions.canManageEvents && statusFilter === 'all' && (
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
          {filteredEvents.map((event) => (
            <Card
              key={event.id}
              className="p-5 hover:border-zinc-600 transition-colors cursor-pointer group"
              onClick={() => router.push(`/e/${event.slug}`)}
            >
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="font-semibold text-white text-lg group-hover:text-accent transition-colors">
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
                    <p className="text-sm text-zinc-400 mb-3">
                      {event.description}
                    </p>
                  )}
                  <div className="flex items-center gap-4 text-sm text-zinc-500">
                    <span>
                      buildathon.live/e/{event.slug}
                    </span>
                    {event.startDate && event.endDate && (
                      <>
                        <span>•</span>
                        <span>
                          {new Date(event.startDate).toLocaleDateString('en-GB')} -{' '}
                          {new Date(event.endDate).toLocaleDateString('en-GB')}
                        </span>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  {permissions.canManageEvents && (
                    <Link
                      href={`/dashboard/${slug}/events/${event.id}`}
                      onClick={(e) => e.stopPropagation()}
                    >
                      <Button variant="secondary" size="sm">
                        Manage
                      </Button>
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
  );
}
