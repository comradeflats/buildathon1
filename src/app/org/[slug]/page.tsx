'use client';

import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Globe, Loader2, Calendar, Building2, Rocket } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useOrganizationBySlug } from '@/hooks/useOrganizations';
import { useEvents } from '@/hooks/useEvents';

export default function OrganizationProfilePage() {
  const params = useParams();
  const slug = params.slug as string;
  
  const { organization, isLoading: isOrgLoading } = useOrganizationBySlug(slug);
  const { events, isLoading: isEventsLoading } = useEvents();

  const isLoading = isOrgLoading || isEventsLoading;

  if (isLoading) {
    return (
      <div className="min-h-[40vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!organization) {
    return (
      <div className="max-w-2xl mx-auto text-center py-12">
        <Building2 size={48} className="mx-auto text-zinc-600 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Organization Not Found</h1>
        <p className="text-zinc-400 mb-6">The organization you are looking for does not exist or has been removed.</p>
        <Link href="/">
          <Button>
            <ArrowLeft size={16} className="mr-2" />
            Back to Home
          </Button>
        </Link>
      </div>
    );
  }

  // Filter public events for this organization
  const orgEvents = events.filter(e => 
    e.organizationId === organization.id && 
    (e.visibility === 'public' || !e.visibility)
  );

  const activeEvents = orgEvents.filter(e => e.status === 'active');
  const upcomingEvents = orgEvents.filter(e => e.status === 'upcoming');
  const archivedEvents = orgEvents.filter(e => e.status === 'archived');

  const formatDates = (start?: string, end?: string) => {
    if (!start || !end) return null;
    return `${new Date(start).toLocaleDateString()} - ${new Date(end).toLocaleDateString()}`;
  };

  const renderEventCard = (event: any) => {
    const eventUrl = event.slug ? `/e/${event.slug}` : `/events/${event.id}`;
    
    return (
      <Link key={event.id} href={eventUrl}>
        <Card hover className="p-5 h-full">
          <div className="flex items-start justify-between mb-2">
            <h3 className="font-bold text-white text-lg">{event.name}</h3>
            {event.status === 'active' && (
              <Badge variant="success">Live</Badge>
            )}
            {event.status === 'upcoming' && (
              <Badge variant="default">Soon</Badge>
            )}
            {event.status === 'archived' && (
              <Badge variant="outline">Past</Badge>
            )}
          </div>
          
          {event.description && (
            <p className="text-zinc-400 text-sm mb-4 line-clamp-2">{event.description}</p>
          )}
          
          <div className="flex items-center text-xs text-zinc-500 mt-auto">
            <Calendar size={14} className="mr-1.5" />
            {formatDates(event.startDate, event.endDate) || 'Dates TBA'}
          </div>
        </Card>
      </Link>
    );
  };

  return (
    <div className="max-w-4xl mx-auto">
      <Link href="/" className="inline-flex items-center text-sm text-zinc-400 hover:text-white mb-6">
        <ArrowLeft size={16} className="mr-1" />
        Back to Discovery
      </Link>

      <Card className="p-8 mb-8 border-indigo-500/20 bg-gradient-to-b from-indigo-500/10 to-transparent">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <div className="w-24 h-24 rounded-xl bg-zinc-800 flex items-center justify-center shrink-0 overflow-hidden border border-zinc-700">
            {organization.logoUrl ? (
              <img src={organization.logoUrl} alt={organization.name} className="w-full h-full object-cover" />
            ) : (
              <Building2 size={40} className="text-zinc-600" />
            )}
          </div>
          
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-white mb-2">{organization.name}</h1>
            
            {organization.description && (
              <p className="text-zinc-300 text-lg mb-4 max-w-2xl">{organization.description}</p>
            )}
            
            <div className="flex flex-wrap items-center gap-4 text-sm">
              {organization.websiteUrl && (
                <a href={organization.websiteUrl} target="_blank" rel="noopener noreferrer" className="flex items-center text-accent hover:underline">
                  <Globe size={16} className="mr-1.5" />
                  Website
                </a>
              )}
              <div className="flex items-center text-zinc-400">
                <Calendar size={16} className="mr-1.5" />
                Joined {new Date(organization.createdAt).getFullYear()}
              </div>
              <div className="flex items-center text-zinc-400">
                <Rocket size={16} className="mr-1.5" />
                {orgEvents.length} Events Hosted
              </div>
            </div>
          </div>
        </div>
      </Card>

      <div className="space-y-10">
        {activeEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Active Buildathons
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {activeEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {upcomingEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4">Upcoming Buildathons</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {upcomingEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {archivedEvents.length > 0 && (
          <section>
            <h2 className="text-xl font-bold text-white mb-4 text-zinc-400">Past Buildathons</h2>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {archivedEvents.map(renderEventCard)}
            </div>
          </section>
        )}

        {orgEvents.length === 0 && (
          <Card className="p-12 text-center border-dashed">
            <Calendar size={48} className="mx-auto text-zinc-700 mb-4" />
            <h3 className="text-xl font-medium text-zinc-300 mb-2">No public events yet</h3>
            <p className="text-zinc-500">This organization hasn't published any buildathons.</p>
          </Card>
        )}
      </div>
    </div>
  );
}
