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
  CheckCircle,
  Clock,
  Archive,
  AlertCircle,
  Users,
  Trophy,
  Edit2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { useAdmin } from '@/context/AdminContext';
import { useEvents } from '@/hooks/useEvents';
import { useTeams } from '@/hooks/useTeams';
import { Event, Team } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading, logout } = useAdmin();
  const { events, isLoading: isEventsLoading, createEvent, updateEvent, deleteEvent } = useEvents();
  const { teams, isLoading: isTeamsLoading, removeTeam } = useTeams();

  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newEventName, setNewEventName] = useState('');
  const [newEventDescription, setNewEventDescription] = useState('');
  const [newEventStatus, setNewEventStatus] = useState<'upcoming' | 'active' | 'archived'>('upcoming');
  const [newEventStartDate, setNewEventStartDate] = useState('');
  const [newEventEndDate, setNewEventEndDate] = useState('');
  const [newEventSubmissionDeadline, setNewEventSubmissionDeadline] = useState('');
  const [isCreating, setIsCreating] = useState(false);
  const [generatingThemesFor, setGeneratingThemesFor] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Edit event state
  const [editingEventId, setEditingEventId] = useState<string | null>(null);
  const [editEventName, setEditEventName] = useState('');
  const [editEventDescription, setEditEventDescription] = useState('');
  const [editEventStatus, setEditEventStatus] = useState<'upcoming' | 'active' | 'archived'>('upcoming');
  const [editEventStartDate, setEditEventStartDate] = useState('');
  const [editEventEndDate, setEditEventEndDate] = useState('');
  const [editEventSubmissionDeadline, setEditEventSubmissionDeadline] = useState('');
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

    try {
      await createEvent({
        id: eventId,
        name: newEventName.trim(),
        description: newEventDescription.trim() || undefined,
        isActive: newEventStatus === 'active',
        status: newEventStatus,
        startDate: newEventStartDate,
        endDate: newEventEndDate,
        submissionDeadline: newEventSubmissionDeadline || undefined,
        createdAt: new Date().toISOString(),
        themesGenerated: false,
      });

      setNewEventName('');
      setNewEventDescription('');
      setNewEventStatus('upcoming');
      setNewEventStartDate('');
      setNewEventEndDate('');
      setNewEventSubmissionDeadline('');
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

  const handleToggleStatus = async (event: Event, newStatus: 'upcoming' | 'active' | 'archived') => {
    try {
      await updateEvent({
        ...event,
        status: newStatus,
        isActive: newStatus === 'active',
      });
    } catch (err) {
      setError('Failed to update event');
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

  const handleDeleteTeam = async (teamId: string) => {
    try {
      await removeTeam(teamId);
    } catch (err) {
      setError('Failed to delete submission');
    }
  };

  const handleStartEdit = (event: Event) => {
    setEditingEventId(event.id);
    setEditEventName(event.name);
    setEditEventDescription(event.description || '');
    setEditEventStatus(event.status || 'upcoming');
    // Convert ISO date strings to datetime-local format
    setEditEventStartDate(event.startDate ? event.startDate.slice(0, 16) : '');
    setEditEventEndDate(event.endDate ? event.endDate.slice(0, 16) : '');
    setEditEventSubmissionDeadline(event.submissionDeadline ? event.submissionDeadline.slice(0, 16) : '');
    setError(null);
  };

  const handleCancelEdit = () => {
    setEditingEventId(null);
    setEditEventName('');
    setEditEventDescription('');
    setEditEventStatus('upcoming');
    setEditEventStartDate('');
    setEditEventEndDate('');
    setEditEventSubmissionDeadline('');
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
        isActive: editEventStatus === 'active',
        startDate: editEventStartDate,
        endDate: editEventEndDate,
        submissionDeadline: editEventSubmissionDeadline || undefined,
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

  if (isAdminLoading || isEventsLoading || isTeamsLoading) {
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
      <div className="flex items-center justify-between">
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
        <Button variant="secondary" onClick={handleLogout}>
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Events */}
        <div className="lg:col-span-2 space-y-6">
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
                <div className="grid grid-cols-2 gap-4">
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
                  <label className="block text-sm font-medium text-zinc-400 mb-2">Status</label>
                  <select
                    value={newEventStatus}
                    onChange={(e) => setNewEventStatus(e.target.value as any)}
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-accent"
                  >
                    <option value="upcoming">Upcoming</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                  </select>
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
                        <div className="grid grid-cols-2 gap-4">
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
                      <div className="flex flex-wrap items-center justify-between gap-4">
                        <div className="min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <h3 className="font-medium text-white">{event.name}</h3>
                            <Badge variant={event.status === 'active' ? 'success' : 'default'} className="text-[10px]">
                              {event.status}
                            </Badge>
                          </div>
                          <p className="text-xs text-zinc-500">{event.id}</p>
                        </div>

                        <div className="flex items-center gap-2">
                          <select
                            value={event.status}
                            onChange={(e) => handleToggleStatus(event, e.target.value as any)}
                            className="text-xs bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-white focus:outline-none focus:ring-1 focus:ring-accent"
                          >
                            <option value="upcoming">Upcoming</option>
                            <option value="active">Active</option>
                            <option value="archived">Archived</option>
                          </select>

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

        {/* Right Column: Submissions Management */}
        <div className="space-y-6">
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
              <Trophy size={20} className="text-winner" />
              Submissions
            </h2>

            <div className="space-y-4">
              {isTeamsLoading ? (
                <div className="py-8 flex justify-center"><Loader2 className="animate-spin text-zinc-600" /></div>
              ) : teams.length === 0 ? (
                <p className="text-sm text-zinc-500 text-center py-4">No submissions yet.</p>
              ) : (
                teams.map((team) => {
                  const event = events.find(e => e.id === team.eventId);
                  return (
                    <div key={team.id} className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800 space-y-2">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0 flex-1">
                          <h4 className="text-sm font-bold text-white truncate" title={team.projectName}>
                            {team.projectName}
                          </h4>
                          <p className="text-[10px] text-zinc-500 truncate">{team.name}</p>
                        </div>
                        <DeleteButton onDelete={() => handleDeleteTeam(team.id)} itemName={team.projectName} />
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Badge variant="secondary" className="text-[9px] px-1.5 py-0 bg-zinc-800 text-zinc-400 border-none">
                          {event?.name || 'Unknown Event'}
                        </Badge>
                      </div>
                    </div>
                  );
                })
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
        <Link href="/">
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
