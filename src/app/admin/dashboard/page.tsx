'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Plus,
  Sparkles,
  Loader2,
  LogOut,
  ArrowLeft,
  Trash2,
  AlertCircle,
  Users,
  Edit2,
  Eye,
  EyeOff,
  ShieldCheck,
  ShieldAlert,
  RotateCcw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdmin } from '@/context/AdminContext';
import { useEvents } from '@/hooks/useEvents';
import { useVoting } from '@/context/VotingContext';
import { Event } from '@/lib/types';
import { generateSubmissionCode } from '@/lib/utils';
import { REGIONS } from '@/lib/constants';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading, logout } = useAdmin();
  const { events, isLoading: isEventsLoading, createEvent, updateEvent, deleteEvent, resetEvent } = useEvents();
  const { showToast } = useVoting();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventStatus, setNewEventStatus] = useState<'upcoming' | 'active' | 'archived'>('upcoming');
  const [newEventRegion, setNewEventRegion] = useState('');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventSubmissionDeadline, setNewEventSubmissionDeadline] = useState('');
  const [newEventKeyboardsDown, setNewEventKeyboardsDown] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatingThemesFor, setGeneratingThemesFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit event state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventStatus, setEditEventStatus] = useState<'upcoming' | 'active' | 'archived'>('upcoming');
  const [editEventRegion, setEditEventRegion] = useState('');
  const [editEventStartDate, setEditEventStartDate] = useState('');
  const [editEventEndDate, setEditEventEndDate] = useState('');
  const [editEventSubmissionDeadline, setEditEventSubmissionDeadline] = useState('');
  const [editEventKeyboardsDown, setEditEventKeyboardsDown] = useState('');
  const [editEventSubmissionCode, setEditEventSubmissionCode] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!isAdminLoading && !isAdmin) {
      router.push('/admin');
    }
  }, [isAdmin, isAdminLoading, router]);

  const handleCreateEvent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEventName.trim() || !newEventStartDate || !newEventEndDate) return;

    setIsCreating(true);
    setError(null);

    const eventId = newEventName
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');

    const submissionCode = generateSubmissionCode();

    try {
      await createEvent({
        id: eventId,
        name: newEventName.trim(),
        description: newEventDescription.trim() || undefined,
        isActive: newEventStatus === 'active',
        status: newEventStatus,
        region: newEventRegion || undefined,
        phase: 'registration',
        votingModel: 'peer',
        startDate: newEventStartDate,
        endDate: newEventEndDate,
        submissionDeadline: newEventSubmissionDeadline || undefined,
        keyboardsDownTime: newEventKeyboardsDown || undefined,
        createdAt: new Date().toISOString(),
        themesGenerated: false,
        isLive: false,
        visibility: 'public',
        showVotes: true,
        slug: eventId,
        organizationId: 'legacy',
        submissionCode,
        isRegistrationOpen: true,
        maxParticipants: 50,
      });

      setNewEventName('');
      setNewEventDescription('');
      setNewEventStatus('upcoming');
      setNewEventRegion('');
      setNewEventStartDate('');
      setNewEventEndDate('');
      setNewEventSubmissionDeadline('');
      setNewEventKeyboardsDown('');
      setShowCreateForm(false);
    } catch (err) {
      setError('Failed to create event');
    } finally {
      setIsCreating(false);
    }
  };

  const handleGenerateThemes = async (eventId: string) => {
    setGeneratingThemesFor(eventId);
    setError(null);

    try {
      const response = await fetch('/api/admin/generate-themes', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          adminSession: 'authenticated',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to generate themes');
      }

      window.location.reload();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate themes');
    } finally {
      setGeneratingThemesFor(null);
    }
  };

  const handleGoLive = async (event: Event) => {
    if (!event.forceLive) {
      setError('Please enable "Force Live" toggle before going live');
      return;
    }

    if (!confirm('Are you sure you want to go live? This will update the start date to now and reveal full themes to participants.')) {
      return;
    }

    try {
      await updateEvent({
        ...event,
        status: 'active',
        isActive: true,
        isLive: true,
        phase: 'building',
        startDate: new Date().toISOString(),
      });
    } catch (err) {
      setError('Failed to go live');
    }
  };

  const handleResetEvent = async (event: Event) => {
    if (!confirm('DANGER: This will reset the event to "Registration" phase AND DELETE ALL SUBMISSIONS AND VOTES. This cannot be undone. Are you sure?')) {
      return;
    }

    try {
      await resetEvent(event.id);
      showToast('Event reset successfully', 'success');
    } catch (err) {
      setError('Failed to reset event');
    }
  };

  const handleToggleForceLive = async (event: Event) => {
    try {
      await updateEvent({
        ...event,
        forceLive: !event.forceLive,
      });
    } catch (err) {
      setError('Failed to toggle safety lock');
    }
  };

  const handleArchive = async (event: Event) => {
    if (!confirm('Are you sure you want to archive this event? This will end the voting and move it to the completed section.')) {
      return;
    }

    try {
      await updateEvent({
        ...event,
        status: 'archived',
        isActive: false,
        phase: 'results',
      });
    } catch (err) {
      setError('Failed to archive event');
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!confirm('Are you sure? This will delete the event AND ALL associated themes, teams, and votes. This action cannot be undone.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
    } catch (err) {
      setError('Failed to delete event');
    }
  };

  const handleToggleScoresRevealed = async (event: Event) => {
    try {
      await updateEvent({
        ...event,
        scoresRevealed: !event.scoresRevealed,
      });
    } catch (err) {
      setError('Failed to update score visibility');
    }
  };

  const handleStartEdit = (event: Event) => {
    setEditingEventId(event.id);
    setEditEventName(event.name);
    setEditEventDescription(event.description || '');
    setEditEventStatus(event.status || 'upcoming');
    setEditEventRegion(event.region || '');
    // Convert ISO date strings to datetime-local format
    setEditEventStartDate(event.startDate ? event.startDate.slice(0, 16) : '');
    setEditEventEndDate(event.endDate ? event.endDate.slice(0, 16) : '');
    setEditEventSubmissionDeadline(event.submissionDeadline ? event.submissionDeadline.slice(0, 16) : '');
    setEditEventKeyboardsDown(event.keyboardsDownTime ? event.keyboardsDownTime.slice(0, 16) : '');
    setEditEventSubmissionCode(event.submissionCode || '');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEditEventName('');
    setEditEventDescription('');
    setEditEventStatus('upcoming');
    setEditEventRegion('');
    setEditEventStartDate('');
    setEditEventEndDate('');
    setEditEventSubmissionDeadline('');
    setEditEventKeyboardsDown('');
    setEditEventSubmissionCode('');
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEventId || !editEventName.trim() || !editEventStartDate || !editEventEndDate) return;

    const eventToUpdate = events.find(ev => ev.id === editingEventId);
    if (!eventToUpdate) return;

    setIsUpdating(true);
    setError(null);

    try {
      await updateEvent({
        ...eventToUpdate,
        name: editEventName.trim(),
        description: editEventDescription.trim() || undefined,
        status: editEventStatus,
        region: editEventRegion || undefined,
        isActive: editEventStatus === 'active',
        startDate: editEventStartDate,
        endDate: editEventEndDate,
        submissionDeadline: editEventSubmissionDeadline || undefined,
        keyboardsDownTime: editEventKeyboardsDown || undefined,
        submissionCode: editEventSubmissionCode || eventToUpdate.submissionCode || generateSubmissionCode(),
        isRegistrationOpen: eventToUpdate.isRegistrationOpen ?? true,
        maxParticipants: eventToUpdate.maxParticipants ?? 50,
      });
      handleCancelEdit();
    } catch (err) {
      setError('Failed to update event');
    } finally {
      setIsUpdating(false);
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/admin');
  };

  if (isAdminLoading || isEventsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Link
            href="/"
            className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-colors"
          >
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-zinc-400 text-sm">Manage events, themes, and submissions</p>
          </div>
        </div>
        <Button variant="secondary" onClick={handleLogout} className="w-full sm:w-auto">
          <LogOut size={16} className="mr-2" />
          Logout
        </Button>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400">
          <AlertCircle size={18} />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 gap-8">
        {/* Events */}
        <div className="space-y-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Calendar size={20} className="text-accent" />
                Events
              </h2>
              {!showCreateForm && (
                <Button size="sm" onClick={() => setShowCreateForm(true)}>
                  <Plus size={16} className="mr-1" />
                  New Event
                </Button>
              )}
            </div>

            {showCreateForm && (
              <form onSubmit={handleCreateEvent} className="mb-8 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50 space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">
                    Event Name <span className="text-red-400">*</span>
                  </label>
                  <input
                    type="text"
                    value={newEventName}
                    onChange={(e) => setNewEventName(e.target.value)}
                    placeholder="e.g., April Buildathon 2026"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                    autoFocus
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                  <textarea
                    value={newEventDescription}
                    onChange={(e) => setNewEventDescription(e.target.value)}
                    placeholder="Brief description..."
                    rows={2}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date *</label>
                    <input
                      type="datetime-local"
                      value={newEventStartDate}
                      onChange={(e) => setNewEventStartDate(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-zinc-400 mb-2">End Date *</label>
                    <input
                      type="datetime-local"
                      value={newEventEndDate}
                      onChange={(e) => setNewEventEndDate(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Keyboards Down Time</label>
                  <input
                    type="datetime-local"
                    value={newEventKeyboardsDown}
                    onChange={(e) => setNewEventKeyboardsDown(e.target.value)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  />
                  <p className="text-xs text-zinc-500 mt-1">When coding must stop - commits after this time will be flagged</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Status</label>
                    <select
                      value={newEventStatus}
                      onChange={(e) => setNewEventStatus(e.target.value as any)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-zinc-400">Region</label>
                    <select
                      value={newEventRegion}
                      onChange={(e) => setNewEventRegion(e.target.value)}
                      className="w-full bg-zinc-900 border border-zinc-800 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                    >
                      <option value="">Select a region...</option>
                      {REGIONS.map(r => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  <Button type="submit" size="sm" disabled={!newEventName.trim() || !newEventStartDate || !newEventEndDate || isCreating}>
                    Create Event
                  </Button>
                  <Button type="button" variant="secondary" size="sm" onClick={() => setShowCreateForm(false)}>
                    Cancel
                  </Button>
                </div>
              </form>
            )}

            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-8">No events found.</p>
              ) : (
                events.map((event) => (
                  <div key={event.id} className="p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
                    {editingEventId === event.id ? (
                      // Edit Form
                      <form onSubmit={handleSaveEdit} className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">
                            Event Name <span className="text-red-400">*</span>
                          </label>
                          <input
                            type="text"
                            value={editEventName}
                            onChange={(e) => setEditEventName(e.target.value)}
                            placeholder="e.g., April Buildathon 2026"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                            autoFocus
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Description</label>
                          <textarea
                            value={editEventDescription}
                            onChange={(e) => setEditEventDescription(e.target.value)}
                            placeholder="Brief description..."
                            rows={2}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2.5 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
                          />
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Start Date *</label>
                            <input
                              type="datetime-local"
                              value={editEventStartDate}
                              onChange={(e) => setEditEventStartDate(e.target.value)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-zinc-400 mb-2">End Date *</label>
                            <input
                              type="datetime-local"
                              value={editEventEndDate}
                              onChange={(e) => setEditEventEndDate(e.target.value)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            />
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Submission Deadline</label>
                          <input
                            type="datetime-local"
                            value={editEventSubmissionDeadline}
                            onChange={(e) => setEditEventSubmissionDeadline(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Keyboards Down Time</label>
                          <input
                            type="datetime-local"
                            value={editEventKeyboardsDown}
                            onChange={(e) => setEditEventKeyboardsDown(e.target.value)}
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                          <p className="text-xs text-zinc-500 mt-1">When coding must stop - commits after this time will be flagged</p>
                        </div>
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
                            <select
                              value={editEventStatus}
                              onChange={(e) => setEditEventStatus(e.target.value as any)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                              <option value="upcoming">Upcoming</option>
                              <option value="active">Active</option>
                              <option value="archived">Archived</option>
                            </select>
                          </div>
                          <div className="space-y-1">
                            <label className="block text-sm font-medium text-zinc-400 mb-2">Region</label>
                            <select
                              value={editEventRegion}
                              onChange={(e) => setEditEventRegion(e.target.value)}
                              className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                            >
                              <option value="">Select a region...</option>
                              {REGIONS.map(r => (
                                <option key={r} value={r}>{r}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-zinc-400 mb-2">Submission Code (revealed at event)</label>
                          <input
                            type="text"
                            value={editEventSubmissionCode}
                            onChange={(e) => setEditEventSubmissionCode(e.target.value.toUpperCase())}
                            placeholder="e.g. GEMINI"
                            className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                          />
                        </div>
                        <div className="flex gap-2 pt-2">
                          <Button
                            type="submit"
                            size="sm"
                            disabled={!editEventName.trim() || !editEventStartDate || !editEventEndDate || isUpdating}
                          >
                            {isUpdating ? <Loader2 size={14} className="animate-spin mr-1" /> : null}
                            Save Changes
                          </Button>
                          <Button type="button" variant="secondary" size="sm" onClick={handleCancelEdit}>
                            Cancel
                          </Button>
                        </div>
                      </form>
                    ) : (
                      // Normal Display
                      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{event.name}</h3>
                            <Badge variant={event.status === 'active' ? 'success' : 'default'} className="text-[10px]">
                              {event.status}
                            </Badge>
                            {event.submissionCode && (
                              <Badge variant="outline" className="text-[10px] border-accent/50 text-accent">
                                Code: {event.submissionCode}
                              </Badge>
                            )}
                          </div>
                          <p className="text-xs text-zinc-500">{event.id}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          {event.status === 'upcoming' && (
                            <div className="flex items-center gap-1">
                              <button
                                onClick={() => handleToggleForceLive(event)}
                                title={event.forceLive ? "Safety Lock: ON (Click to lock)" : "Safety Lock: OFF (Click to unlock)"}
                                className={`p-1.5 rounded-lg transition-all ${event.forceLive ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500 hover:text-zinc-300'}`}
                              >
                                {event.forceLive ? <ShieldCheck size={16} /> : <ShieldAlert size={16} />}
                              </button>
                              <Button
                                size="sm"
                                onClick={() => handleGoLive(event)}
                                className={`h-8 text-xs font-bold transition-all ${event.forceLive ? 'bg-emerald-600 hover:bg-emerald-500' : 'bg-zinc-800 text-zinc-600 cursor-not-allowed'}`}
                              >
                                GO LIVE
                              </Button>
                            </div>
                          )}

                          {event.status === 'active' && (
                            <>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleResetEvent(event)}
                                title="Reset Event (Deletes submissions)"
                                className="h-8 w-8 p-0 text-red-500 hover:bg-red-500/10"
                              >
                                <RotateCcw size={16} />
                              </Button>
                              <Button
                                size="sm"
                                variant="secondary"
                                onClick={() => handleArchive(event)}
                                className="h-8 text-xs border-zinc-700 text-zinc-400 font-bold"
                              >
                                ARCHIVE
                              </Button>
                            </>
                          )}

                          <Button
                            size="sm"
                            variant={event.themesGenerated ? 'secondary' : 'primary'}
                            onClick={() => handleGenerateThemes(event.id)}
                            disabled={generatingThemesFor === event.id}
                            className="h-8 text-xs"
                          >
                            {generatingThemesFor === event.id ? (
                              <Loader2 size={14} className="animate-spin" />
                            ) : (
                              <Sparkles size={14} className="mr-1" />
                            )}
                            {event.themesGenerated ? 'Themes' : 'Generate'}
                          </Button>

                          <Button
                            size="sm"
                            variant={event.scoresRevealed ? 'secondary' : 'primary'}
                            onClick={() => handleToggleScoresRevealed(event)}
                            className="h-8 text-xs"
                            title={event.scoresRevealed ? 'Hide Scores' : 'Reveal Scores'}
                          >
                            {event.scoresRevealed ? (
                              <>
                                <EyeOff size={14} className="mr-1" />
                                Hide
                              </>
                            ) : (
                              <>
                                <Eye size={14} className="mr-1" />
                                Reveal
                              </>
                            )}
                          </Button>

                          <button
                            onClick={() => handleStartEdit(event)}
                            className="p-2 text-zinc-600 hover:text-accent hover:bg-accent/10 rounded-lg transition-colors"
                            title="Edit Event"
                          >
                            <Edit2 size={16} />
                          </button>

                          <button
                            onClick={() => handleDeleteEvent(event.id)}
                            className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                            title="Delete Event"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </Card>
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
        <Link href="/events">
          <Card className="p-4 hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-accent transition-colors">Event Library</h3>
                <p className="text-sm text-zinc-400">Browse and manage all hackathon events</p>
              </div>
              <Calendar className="text-zinc-600 group-hover:text-accent transition-colors" size={24} />
            </div>
          </Card>
        </Link>
        <Link href="/events">
          <Card className="p-4 hover:border-zinc-700 transition-colors cursor-pointer group">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-white mb-1 group-hover:text-accent transition-colors">Project Gallery</h3>
                <p className="text-sm text-zinc-400">View public submission gallery</p>
              </div>
              <Users className="text-zinc-600 group-hover:text-accent transition-colors" size={24} />
            </div>
          </Card>
        </Link>
      </div>
    </div>
  );
}
