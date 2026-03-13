'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, ExternalLink, Users, BarChart3, Calendar, Save, AlertCircle } from 'lucide-react';
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
  const { getEventById, updateEvent, isLoading: isEventsLoading } = useEvents();
  const { teams } = useTeams();
  const { getThemesByEventId } = useThemes();

  const [org, setOrg] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    location: '',
    status: 'upcoming'
  });

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

  // Get event and initialize form
  useEffect(() => {
    if (!isEventsLoading && eventId) {
      const foundEvent = getEventById(eventId);
      if (foundEvent) {
        if (org && foundEvent.organizationId !== org.id) {
          router.push(`/dashboard/${orgSlug}/events`);
        } else {
          setEvent(foundEvent);
          setEditForm({
            name: foundEvent.name || '',
            description: foundEvent.description || '',
            startDate: foundEvent.startDate ? new Date(foundEvent.startDate).toISOString().slice(0, 16) : '',
            endDate: foundEvent.endDate ? new Date(foundEvent.endDate).toISOString().slice(0, 16) : '',
            submissionDeadline: foundEvent.submissionDeadline ? new Date(foundEvent.submissionDeadline).toISOString().slice(0, 16) : '',
            location: foundEvent.location || '',
            status: foundEvent.status || 'upcoming'
          });
        }
      }
    }
  }, [eventId, getEventById, org, orgSlug, router, isEventsLoading]);

  const { permissions, isLoading: permsLoading, orgId: fetchedOrgId } = useOrgPermissions(org?.id);

  const isLoading = authLoading || orgsLoading || permsLoading || isEventsLoading || !org || !event;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await updateEvent({
        ...event,
        ...editForm,
        startDate: new Date(editForm.startDate).toISOString(),
        endDate: new Date(editForm.endDate).toISOString(),
        submissionDeadline: editForm.submissionDeadline ? new Date(editForm.submissionDeadline).toISOString() : undefined,
      });
      setIsEditing(false);
    } catch (err) {
      console.error('Failed to update event:', err);
      alert('Failed to update event. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  // Redirect if not authenticated
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
    <div className="space-y-6 pb-20">
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
            {event.description && !isEditing && (
              <p className="text-zinc-400">{event.description}</p>
            )}
          </div>
          <div className="flex items-center gap-3">
            <Button 
              variant={isEditing ? "ghost" : "secondary"} 
              onClick={() => setIsEditing(!isEditing)}
              disabled={isSaving}
            >
              {isEditing ? 'Cancel' : 'Edit Event'}
            </Button>
            {!isEditing && (
              <Link href={`/e/${event.slug}`} target="_blank">
                <Button>
                  View Public Page
                  <ExternalLink size={16} className="ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <Card className="p-8 border-accent/20 bg-accent/5 animate-in fade-in slide-in-from-top-4">
          <div className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Event Name</label>
                <input 
                  type="text" 
                  value={editForm.name}
                  onChange={(e) => setEditForm({...editForm, name: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Status</label>
                <select 
                  value={editForm.status}
                  onChange={(e) => setEditForm({...editForm, status: e.target.value as any})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                >
                  <option value="upcoming">Upcoming</option>
                  <option value="active">Active (Live)</option>
                  <option value="archived">Archived (Ended)</option>
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Description</label>
              <textarea 
                value={editForm.description}
                onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent h-32"
              />
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Start Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={editForm.startDate}
                  onChange={(e) => setEditForm({...editForm, startDate: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">End Date & Time</label>
                <input 
                  type="datetime-local" 
                  value={editForm.endDate}
                  onChange={(e) => setEditForm({...editForm, endDate: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Submission Deadline</label>
                <input 
                  type="datetime-local" 
                  value={editForm.submissionDeadline}
                  onChange={(e) => setEditForm({...editForm, submissionDeadline: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Location (City or Virtual)</label>
              <input 
                type="text" 
                value={editForm.location}
                onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
              />
            </div>

            <div className="flex justify-end pt-4">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-8 h-12"
              >
                {isSaving ? <Loader2 className="animate-spin mr-2" /> : <Save className="mr-2" />}
                SAVE CHANGES
              </Button>
            </div>
          </div>
        </Card>
      ) : (
        <>
          {/* Stats */}
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Submissions</span>
                <Users className="text-zinc-500" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{eventTeams.length}</div>
              <div className="text-sm text-zinc-500 mt-1">Total projects submitted</div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm text-zinc-400">Themes</span>
                <BarChart3 className="text-zinc-500" size={20} />
              </div>
              <div className="text-3xl font-bold text-white">{eventThemes.length}</div>
              <div className="text-sm text-zinc-500 mt-1">Available themes</div>
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

          {/* Event Details Summary */}
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

              {event.location && (
                <div>
                  <label className="text-sm text-zinc-500">Location</label>
                  <p className="text-white mt-1">{event.location}</p>
                </div>
              )}
            </div>
          </Card>

          {/* Theme Management */}
          <ThemeManager eventId={eventId} organizationId={org.id} />
        </>
      )}
    </div>
  );
}
