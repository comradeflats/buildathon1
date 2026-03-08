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
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAdmin } from '@/context/AdminContext';
import { useEvents } from '@/hooks/useEvents';
import { Event } from '@/lib/types';

export default function AdminDashboardPage() {
  const router = useRouter();
  const { isAdmin, isLoading: isAdminLoading, logout } = useAdmin();
  const { events, isLoading: isEventsLoading, createEvent, updateEvent, deleteEvent } = useEvents();

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

      // Refresh events to show updated themesGenerated status
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
    if (!confirm('Are you sure? This will delete the event and all associated themes.')) {
      return;
    }

    try {
      await deleteEvent(eventId);
    } catch (err) {
      setError('Failed to delete event');
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

  const statusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle size={14} className="text-emerald-500" />;
      case 'upcoming':
        return <Clock size={14} className="text-yellow-500" />;
      case 'archived':
        return <Archive size={14} className="text-zinc-500" />;
      default:
        return null;
    }
  };

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
            <p className="text-zinc-400 text-sm">Manage events and generate themes</p>
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

      {/* Create Event Section */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Calendar size={20} />
            Events
          </h2>
          {!showCreateForm && (
            <Button onClick={() => setShowCreateForm(true)}>
              <Plus size={16} className="mr-2" />
              Create Event
            </Button>
          )}
        </div>

        {showCreateForm && (
          <form onSubmit={handleCreateEvent} className="mb-6 p-4 bg-zinc-800/50 rounded-lg space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Event Name <span className="text-red-400">*</span>
              </label>
              <input
                type="text"
                value={newEventName}
                onChange={(e) => setNewEventName(e.target.value)}
                placeholder="e.g., April Buildathon 2026"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                autoFocus
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Description
              </label>
              <textarea
                value={newEventDescription}
                onChange={(e) => setNewEventDescription(e.target.value)}
                placeholder="Brief description of this buildathon event..."
                rows={2}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Start Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newEventStartDate}
                  onChange={(e) => setNewEventStartDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  End Date <span className="text-red-400">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={newEventEndDate}
                  onChange={(e) => setNewEventEndDate(e.target.value)}
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Submission Deadline
              </label>
              <input
                type="datetime-local"
                value={newEventSubmissionDeadline}
                onChange={(e) => setNewEventSubmissionDeadline(e.target.value)}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
              <p className="text-xs text-zinc-500 mt-1">Optional. If not set, submissions are open until the end date.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Status
              </label>
              <select
                value={newEventStatus}
                onChange={(e) => setNewEventStatus(e.target.value as 'upcoming' | 'active' | 'archived')}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              >
                <option value="upcoming">Upcoming</option>
                <option value="active">Active</option>
                <option value="archived">Archived</option>
              </select>
            </div>
            <div className="flex gap-3">
              <Button type="submit" disabled={!newEventName.trim() || !newEventStartDate || !newEventEndDate || isCreating}>
                {isCreating ? (
                  <>
                    <Loader2 size={16} className="mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  'Create Event'
                )}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setShowCreateForm(false);
                  setNewEventName('');
                  setNewEventDescription('');
                  setNewEventStartDate('');
                  setNewEventEndDate('');
                  setNewEventSubmissionDeadline('');
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Events List */}
        <div className="space-y-4">
          {events.length === 0 ? (
            <p className="text-zinc-400 text-center py-8">
              No events yet. Create your first event to get started.
            </p>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="p-4 bg-zinc-800/50 rounded-lg border border-zinc-700/50"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-semibold text-white">{event.name}</h3>
                      <Badge
                        variant={
                          event.status === 'active'
                            ? 'success'
                            : event.status === 'upcoming'
                            ? 'default'
                            : 'secondary'
                        }
                        className="text-[10px]"
                      >
                        {statusIcon(event.status)}
                        <span className="ml-1">{event.status}</span>
                      </Badge>
                    </div>
                    {event.description && (
                      <p className="text-xs text-zinc-400 mb-1">{event.description}</p>
                    )}
                    <div className="text-xs text-zinc-500 space-y-0.5">
                      <p>ID: {event.id}</p>
                      {event.startDate && event.endDate && (
                        <p>
                          {new Date(event.startDate).toLocaleDateString()} – {new Date(event.endDate).toLocaleDateString()}
                        </p>
                      )}
                      {event.submissionDeadline && (
                        <p>Submissions due: {new Date(event.submissionDeadline).toLocaleString()}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {/* Status Toggle */}
                    <select
                      value={event.status}
                      onChange={(e) =>
                        handleToggleStatus(event, e.target.value as 'upcoming' | 'active' | 'archived')
                      }
                      className="text-xs bg-zinc-700 border border-zinc-600 rounded px-2 py-1 text-white"
                    >
                      <option value="upcoming">Upcoming</option>
                      <option value="active">Active</option>
                      <option value="archived">Archived</option>
                    </select>

                    {/* Generate Themes Button */}
                    <Button
                      size="sm"
                      variant={event.themesGenerated ? 'secondary' : 'primary'}
                      onClick={() => handleGenerateThemes(event.id)}
                      disabled={generatingThemesFor === event.id}
                    >
                      {generatingThemesFor === event.id ? (
                        <>
                          <Loader2 size={14} className="mr-1 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <Sparkles size={14} className="mr-1" />
                          {event.themesGenerated ? 'Regenerate' : 'Generate'} Themes
                        </>
                      )}
                    </Button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeleteEvent(event.id)}
                      className="p-2 rounded-md text-zinc-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
                      title="Delete event"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>

                {event.themesGenerated && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-emerald-500">
                    <CheckCircle size={12} />
                    <span>Themes generated</span>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </Card>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-4">
        <Link href="/events">
          <Card className="p-4 hover:border-zinc-600 transition-colors cursor-pointer">
            <h3 className="font-semibold text-white mb-1">Event Library</h3>
            <p className="text-sm text-zinc-400">Browse all past and current events</p>
          </Card>
        </Link>
        <Link href="/">
          <Card className="p-4 hover:border-zinc-600 transition-colors cursor-pointer">
            <h3 className="font-semibold text-white mb-1">Team Gallery</h3>
            <p className="text-sm text-zinc-400">View and manage team submissions</p>
          </Card>
        </Link>
      </div>
    </div>
  );
}
