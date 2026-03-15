'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2,
  ArrowLeft,
  ExternalLink,
  Users,
  BarChart3,
  Calendar,
  Save,
  AlertCircle,
  Map as MapIcon,
  CheckCircle2,
  Sparkles,
  Zap,
  Trophy,
  LayoutGrid,
  MapPin,
  Clock,
  Rocket,
  ShieldCheck,
  Copy,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useEvents } from '@/hooks/useEvents';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { useTeams } from '@/hooks/useTeams';
import { useThemes } from '@/hooks/useThemes';
import { useVoting } from '@/context/VotingContext';
import { ThemeManager } from '@/components/admin/ThemeManager';
import { EventPhaseController } from '@/components/admin/EventPhaseController';
import { geocodeLocation } from '@/lib/utils';
import { EventPhase } from '@/lib/types';
import { REGIONS } from '@/lib/constants';

const PHASE_CONFIG: Record<EventPhase, { color: string, glow: string }> = {
  registration: { color: 'emerald', glow: 'shadow-emerald-500/20 bg-emerald-500/5' },
  building: { color: 'blue', glow: 'shadow-blue-500/20 bg-blue-500/5' },
  review: { color: 'purple', glow: 'shadow-purple-500/20 bg-purple-500/5' },
  judging: { color: 'pink', glow: 'shadow-pink-500/20 bg-pink-500/5' },
  results: { color: 'yellow', glow: 'shadow-yellow-500/20 bg-yellow-500/5' },
};

function SetupChecklist({ event, eventThemes, onEdit }: { event: any, eventThemes: any[], onEdit: () => void }) {
  const checks = [
    { label: 'Event Description', done: !!event.description, task: 'Add a description to tell builders what to expect.' },
    { label: 'Map Coordinates', done: !!event.coordinates?.lat, task: 'Set location coordinates so your event appears on the map.' },
    { label: 'Themes Created', done: eventThemes.length > 0, task: 'Add at least one theme for participants to build for.' },
    { label: 'Themes Deployed', done: eventThemes.some(t => t.isPublished), task: 'Publish your themes so they are visible on the public page.' },
    { label: 'Submission Code', done: !!event.submissionCode, task: 'Ensure a submission code is set to prevent spam.' },
  ];

  const completed = checks.filter(c => c.done).length;
  if (completed === checks.length) return null;

  return (
    <Card className="p-6 border-amber-500/20 bg-amber-500/5 animate-in fade-in slide-in-from-right-4 duration-500">
      <div className="flex items-center gap-3 mb-4">
        <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
          <AlertCircle size={20} />
        </div>
        <div>
          <h2 className="font-bold text-white">Event Setup Checklist</h2>
          <p className="text-xs text-zinc-400">{completed} of {checks.length} essential steps completed</p>
        </div>
      </div>
      <div className="space-y-3">
        {checks.map((check, i) => (
          <div key={i} className="flex items-start gap-3 group">
            <div className={`mt-0.5 rounded-full p-0.5 ${check.done ? 'bg-emerald-500/20 text-emerald-500' : 'bg-zinc-800 text-zinc-600'}`}>
              <CheckCircle2 size={14} />
            </div>
            <div className="flex-1">
              <p className={`text-sm font-medium ${check.done ? 'text-zinc-400 line-through' : 'text-zinc-200'}`}>
                {check.label}
              </p>
              {!check.done && <p className="text-[10px] text-zinc-500 mt-0.5">{check.task}</p>}
            </div>
          </div>
        ))}
        <Button variant="ghost" size="sm" className="w-full mt-2 border border-amber-500/30 text-amber-400 hover:bg-amber-500/10" onClick={onEdit}>
          Complete Setup
        </Button>
      </div>
    </Card>
  );
}

function LaunchCenter({ event, eventThemes, onLaunchNow }: { event: any, eventThemes: any[], onLaunchNow: () => void }) {
  const [now, setNow] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const hasThemes = eventThemes.some(t => t.isPublished);
  const startTime = new Date(event.startDate);
  const isTimeReached = now >= startTime;
  const isLive = isTimeReached && hasThemes;

  const getTimeRemaining = () => {
    const diff = startTime.getTime() - now.getTime();
    if (diff <= 0) return '00:00:00';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const secs = Math.floor((diff % (1000 * 60)) / 1000);
    
    return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <Card className={`p-1 overflow-hidden border-2 transition-all duration-500 ${isLive ? 'border-emerald-500/50 bg-emerald-500/5' : 'border-zinc-800 bg-zinc-950'}`}>
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4">
        <div className="flex items-center gap-4">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${isLive ? 'bg-emerald-500 text-zinc-950 animate-pulse' : 'bg-zinc-900 text-zinc-500'}`}>
            <Rocket size={24} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="font-black text-white uppercase tracking-wider">
                {isLive ? 'Arena is Live' : 'Launch Center'}
              </h2>
              {isLive && <Badge variant="success" className="bg-emerald-500 text-zinc-950 font-black px-2 py-0 h-5">ACTIVE</Badge>}
            </div>
            <p className="text-xs text-zinc-500 mt-0.5">
              {isLive ? 'Themes are revealed and submissions are open.' : 'Complete setup to activate the arena.'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-6">
          <div className="flex items-center gap-4 px-4 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800/50">
            <div className="flex items-center gap-2">
              {hasThemes ? <CheckCircle2 size={14} className="text-emerald-500" /> : <div className="w-3.5 h-3.5 rounded-full border-2 border-zinc-700" />}
              <span className={`text-[10px] font-bold uppercase tracking-widest ${hasThemes ? 'text-zinc-300' : 'text-zinc-600'}`}>Themes Deployed</span>
            </div>
            <div className="w-px h-4 bg-zinc-800" />
            <div className="flex items-center gap-2">
              {isTimeReached ? <CheckCircle2 size={14} className="text-emerald-500" /> : <Clock size={14} className="text-zinc-600" />}
              <span className={`text-[10px] font-bold uppercase tracking-widest ${isTimeReached ? 'text-zinc-300' : 'text-zinc-600'}`}>
                {isTimeReached ? 'Time Reached' : getTimeRemaining()}
              </span>
            </div>
          </div>

          {!isLive && (
            <Button 
              onClick={onLaunchNow}
              disabled={!hasThemes}
              className={`font-black px-8 h-12 rounded-xl transition-all active:scale-95 ${hasThemes ? 'bg-white text-zinc-950 hover:bg-zinc-200 shadow-xl shadow-white/10' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
            >
              <Zap size={18} className="mr-2 fill-current" />
              LAUNCH NOW
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}

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
  const { showToast } = useVoting();

  const [org, setOrg] = useState<any>(null);
  const [event, setEvent] = useState<any>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isGeocoding, setIsGeocoding] = useState(false);
  const [editForm, setEditForm] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    submissionDeadline: '',
    location: '',
    region: '',
    status: 'upcoming',
    lat: '',
    lng: '',
    visibility: 'public' as 'public' | 'unlisted' | 'private'
  });

  const lookupCoordinates = async () => {
    if (!editForm.location) {
      alert('Please enter a location first');
      return;
    }

    console.log('[GEO] Starting lookup for:', editForm.location);
    setIsGeocoding(true);
    try {
      const result = await geocodeLocation(editForm.location);
      console.log('[GEO] Result received:', result);
      if (result) {
        setEditForm(prev => ({
          ...prev,
          lat: result.lat.toString(),
          lng: result.lng.toString(),
          region: result.region || prev.region
        }));
      } else {
        alert('Could not find coordinates for this location. Try adding a city or country.');
      }
    } catch (error) {
      console.error('[GEO] Error in lookupCoordinates:', error);
    } finally {
      setIsGeocoding(false);
    }
  };

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
            region: foundEvent.region || '',
            status: foundEvent.status || 'upcoming',
            lat: foundEvent.coordinates?.lat?.toString() || '',
            lng: foundEvent.coordinates?.lng?.toString() || '',
            visibility: foundEvent.visibility || 'public'
          });
        }
      }
    }
  }, [eventId, getEventById, org, orgSlug, router, isEventsLoading]);

  const handleLaunchNow = async () => {
    if (!confirm('This will update the start time to NOW and activate the arena immediately. Continue?')) return;
    
    try {
      setIsSaving(true);
      await updateEvent({
        ...event,
        startDate: new Date().toISOString(),
        isLive: true
      });
      showToast('Arena Launched!', 'success');
    } catch (err) {
      showToast('Failed to launch arena', 'error');
    } finally {
      setIsSaving(false);
    }
  };

  const { permissions, isLoading: permsLoading, orgId: fetchedOrgId } = useOrgPermissions(org?.id);

  const isLoading = authLoading || orgsLoading || permsLoading || isEventsLoading || !org || !event;

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const lat = parseFloat(editForm.lat);
      const lng = parseFloat(editForm.lng);

      const { lat: _, lng: __, ...formData } = editForm;

      await updateEvent({
        ...event,
        ...formData,
        region: editForm.region || undefined,
        startDate: new Date(editForm.startDate).toISOString(),
        endDate: new Date(editForm.endDate).toISOString(),
        submissionDeadline: editForm.submissionDeadline ? new Date(editForm.submissionDeadline).toISOString() : undefined,
        coordinates: (!isNaN(lat) && !isNaN(lng)) ? { lat, lng } : event.coordinates
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
  const currentPhase = (event.phase || 'registration') as EventPhase;
  const config = PHASE_CONFIG[currentPhase] || PHASE_CONFIG.registration;

  return (
    <div className="space-y-8 pb-20 relative">
      {/* Background Phase Glow */}
      <div className={`fixed top-0 right-0 w-[500px] h-[500px] rounded-full blur-[120px] -z-10 opacity-20 transition-all duration-1000 ${config.glow.split(' ')[0]}`} />

      {/* Header */}
      <div className="relative">
        <Link
          href={`/dashboard/${orgSlug}/events`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h1 className="text-3xl sm:text-4xl font-black text-white truncate tracking-tight">{event.name}</h1>
              <Badge
                variant={
                  event.status === 'active'
                    ? 'success'
                    : event.status === 'upcoming'
                    ? 'default'
                    : 'secondary'
                }
                className="capitalize px-3 py-1 font-bold"
              >
                {event.status}
              </Badge>
            </div>
            {event.description && !isEditing && (
              <p className="text-zinc-400 max-w-2xl line-clamp-2">{event.description}</p>
            )}
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <Button 
              variant={isEditing ? "ghost" : "secondary"} 
              onClick={() => setIsEditing(!isEditing)}
              disabled={isSaving}
              className="hidden sm:flex"
            >
              {isEditing ? 'Cancel' : 'Edit Details'}
            </Button>
            {!isEditing && (
              <Link href={`/e/${event.slug}`} target="_blank">
                <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black">
                  <span className="hidden sm:inline">View Public</span>
                  <ExternalLink size={16} className="sm:ml-2" />
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {isEditing ? (
        <Card className="p-8 border-emerald-500/20 bg-emerald-500/5 animate-in fade-in slide-in-from-top-4">
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

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Location (City or Virtual)</label>
                  <Button 
                    type="button" 
                    variant="secondary" 
                    size="sm" 
                    onClick={lookupCoordinates}
                    disabled={isGeocoding || !editForm.location}
                    className="text-xs h-8 border-violet-500/30 hover:border-violet-500 hover:bg-violet-500/10 text-violet-400"
                  >
                    {isGeocoding ? (
                      <Loader2 size={12} className="mr-2 animate-spin" />
                    ) : (
                      <MapIcon size={12} className="mr-2" />
                    )}
                    Find on Map
                  </Button>
                </div>
                <input 
                  type="text" 
                  value={editForm.location}
                  onChange={(e) => setEditForm({...editForm, location: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Global Region</label>
                <select 
                  value={editForm.region}
                  onChange={(e) => setEditForm({...editForm, region: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                >
                  <option value="">Select a region...</option>
                  {REGIONS.map(r => (
                    <option key={r} value={r}>{r}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <MapIcon size={14} className="text-emerald-500" />
                  Latitude
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 10.7769"
                  value={editForm.lat}
                  onChange={(e) => setEditForm({...editForm, lat: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-2">
                  <MapIcon size={14} className="text-emerald-500" />
                  Longitude
                </label>
                <input 
                  type="text" 
                  placeholder="e.g. 106.7009"
                  value={editForm.lng}
                  onChange={(e) => setEditForm({...editForm, lng: e.target.value})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6 pt-4 border-t border-zinc-800">
              <div className="space-y-2">
                <label className="text-sm font-bold text-zinc-400 uppercase tracking-wider">Visibility</label>
                <select 
                  value={editForm.visibility}
                  onChange={(e) => setEditForm({...editForm, visibility: e.target.value as any})}
                  className="w-full bg-zinc-900 border border-zinc-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-accent"
                >
                  <option value="public">Public (Global Discovery)</option>
                  <option value="unlisted">Unlisted (Link Only)</option>
                  <option value="private">Private (Org Members Only)</option>
                </select>
                <p className="text-[10px] text-zinc-500 mt-1">Unlisted events won't appear on the global map or discovery pages.</p>
              </div>
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
        <div className="space-y-8">
          {/* Arena Command Center - Prominent Organizer Controls */}
          <section className="animate-in fade-in slide-in-from-top-4 duration-700">
            <EventPhaseController event={event} variant="command-center" />
          </section>

          {/* Launch Center - New Activation Bar */}
          <section className="animate-in fade-in slide-in-from-top-4 duration-1000">
            <LaunchCenter 
              event={event} 
              eventThemes={eventThemes} 
              onLaunchNow={handleLaunchNow} 
            />
          </section>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content Area */}
          <div className="lg:col-span-2 space-y-8">
            {/* Dynamic Reordering based on phase */}
            {event.phase === 'registration' || event.phase === 'building' ? (
              <>
                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles size={18} className="text-emerald-400" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Themes & Rules</h2>
                  </div>
                  <ThemeManager eventId={eventId} organizationId={org.id} />
                </section>

                <section className="space-y-4">
                   <div className="flex items-center gap-2 px-1">
                    <Users size={18} className="text-blue-400" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Submissions ({eventTeams.length})</h2>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Card className="p-6 border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-center py-12">
                       <Users className="text-zinc-700 mb-3" size={32} />
                       <p className="text-zinc-500 text-sm">Participant management coming soon.</p>
                       <p className="text-[10px] text-zinc-600 mt-1">View the public gallery to see all teams.</p>
                    </Card>
                    <Card className="p-6 border-zinc-800 bg-zinc-900/30 flex flex-col items-center justify-center text-center py-12">
                       <BarChart3 className="text-zinc-700 mb-3" size={32} />
                       <div className="text-2xl font-black text-white">{eventTeams.length}</div>
                       <p className="text-zinc-500 text-sm">Projects Submitted</p>
                    </Card>
                  </div>
                </section>
              </>
            ) : (
              <>
                <section className="space-y-4">
                   <div className="flex items-center gap-2 px-1">
                    <Zap size={18} className="text-pink-400" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Live Judging & Results</h2>
                  </div>
                  <div className="grid grid-cols-1 gap-4">
                     <Card className="p-8 border-pink-500/20 bg-pink-500/5 flex flex-col items-center justify-center text-center py-16">
                        <Trophy className="text-pink-500 mb-4 animate-bounce" size={48} />
                        <h3 className="text-xl font-bold text-white mb-2">Reviewing Mode Active</h3>
                        <p className="text-zinc-400 max-w-md">Open the public voting page to participate in demos or reveal final scores to the audience.</p>
                        <Link href={`/vote?event=${event.id}`} target="_blank" className="mt-6">
                           <Button className="bg-pink-500 hover:bg-pink-600 text-white font-black px-8">
                             OPEN VOTING PORTAL
                           </Button>
                        </Link>
                     </Card>
                  </div>
                </section>

                <section className="space-y-4">
                  <div className="flex items-center gap-2 px-1">
                    <Sparkles size={18} className="text-zinc-500" />
                    <h2 className="text-lg font-bold text-white uppercase tracking-wider">Event Themes</h2>
                  </div>
                  <ThemeManager eventId={eventId} organizationId={org.id} />
                </section>
              </>
            )}
          </div>

          {/* Sidebar Area */}
          <div className="space-y-6">
            {/* 1. Setup Checklist for new events */}
            <SetupChecklist event={event} eventThemes={eventThemes} onEdit={() => setIsEditing(true)} />

            {/* 2. Quick Stats */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
               <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Timeline</h3>
               <div className="space-y-4">
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                       <Calendar size={14} />
                       <span className="text-sm">Start</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                       {event.startDate && new Date(event.startDate).toLocaleDateString('en-GB')}
                    </span>
                 </div>
                 <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-zinc-400">
                       <Clock size={14} />
                       <span className="text-sm">Ends</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                       {event.endDate && new Date(event.endDate).toLocaleDateString('en-GB')}
                    </span>
                 </div>
               </div>
            </Card>

            {/* 3. Event Link & Details */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Event Access</h3>
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-zinc-600 uppercase tracking-wider">Public URL</label>
                  <div className="flex items-center gap-2 mt-1">
                    <input 
                      readOnly 
                      value={`buildathon.live/e/${event.slug}`}
                      className="text-[11px] text-zinc-400 bg-black border border-zinc-800 px-3 py-2 rounded flex-1 truncate"
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-8 w-8 p-0"
                      onClick={() => {
                        navigator.clipboard.writeText(`https://buildathon.live/e/${event.slug}`);
                      }}
                    >
                      <Save size={14} />
                    </Button>
                  </div>
                </div>

                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5">
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <label className="text-[10px] font-bold text-emerald-400 uppercase tracking-wider">Submission Code</label>
                      <div className="group relative">
                        <Info size={12} className="text-zinc-500 hover:text-zinc-400 cursor-help" />
                        <div className="absolute left-0 top-full mt-2 w-64 p-3 bg-zinc-900 border border-zinc-700 rounded-lg text-xs text-zinc-300 leading-relaxed opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10 shadow-xl">
                          Share this code with participants. They'll need it to submit their projects.
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-6 px-2 text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                      onClick={() => {
                        navigator.clipboard.writeText(event.submissionCode || '');
                        showToast?.('Submission code copied!', 'success');
                      }}
                    >
                      <Copy size={12} className="mr-1" />
                      Copy
                    </Button>
                  </div>
                  <code className="block text-2xl font-black text-emerald-400 bg-emerald-500/10 px-4 py-3 rounded-lg text-center tracking-[0.3em] border border-emerald-500/20">
                    {event.submissionCode || 'NONE'}
                  </code>
                  <p className="text-[9px] text-zinc-500 text-center mt-2">
                    Required for project submissions
                  </p>
                </div>

                <div className="pt-2">
                   <Link href={`/gallery/${event.id}`} target="_blank" className="w-full">
                      <Button variant="secondary" className="w-full text-xs border-zinc-700 text-zinc-400 hover:text-white">
                        <LayoutGrid size={14} className="mr-2" />
                        Live Project Gallery
                      </Button>
                   </Link>
                </div>
              </div>
            </Card>

            {/* 4. Location Details */}
            <Card className="p-6 bg-zinc-900/50 border-zinc-800">
              <h3 className="text-xs font-black text-zinc-500 uppercase tracking-widest mb-4">Location</h3>
              <div className="space-y-3">
                 <div className="flex items-start gap-2">
                    <MapPin size={16} className="text-zinc-500 shrink-0 mt-0.5" />
                    <div>
                       <p className="text-sm text-white font-medium">{event.location || 'Not set'}</p>
                       {!event.coordinates?.lat && (
                         <p className="text-[10px] text-amber-500 mt-1 flex items-center gap-1">
                            <AlertCircle size={10} />
                            Missing coordinates
                         </p>
                       )}
                    </div>
                 </div>
              </div>
            </Card>

            <div className="pt-4 px-2">
               <p className="text-[10px] text-zinc-600 text-center leading-relaxed">
                  Tip: Change phases to control what participants see on the public portal.
               </p>
            </div>
          </div>
        </div>
      </div>
      )}
    </div>
  );
}
