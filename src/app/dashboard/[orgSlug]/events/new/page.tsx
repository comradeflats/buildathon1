'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Calendar, ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { createSlug, validateSlug } from '@/lib/slugs';

export default function NewEventPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.orgSlug as string;

  const { user, isLoading: authLoading, getFirebaseToken } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const [org, setOrg] = useState<any>(null);

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

  const { permissions } = useOrgPermissions(org?.id);

  // Form state
  const [eventName, setEventName] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [description, setDescription] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = authLoading || orgsLoading || !org;

  // Auto-generate slug from event name
  useEffect(() => {
    if (!slugTouched && eventName) {
      setEventSlug(createSlug(eventName));
    }
  }, [eventName, slugTouched]);

  // Redirect if not authenticated or no permissions
  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (org && !permissions.canManageEvents) {
      router.push(`/dashboard/${slug}`);
    }
  }, [permissions, org, slug, router]);

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setEventSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!eventName.trim()) {
      setError('Event name is required');
      return;
    }

    if (!eventSlug.trim()) {
      setError('Event slug is required');
      return;
    }

    if (!validateSlug(eventSlug)) {
      setError('Invalid slug format. Use only lowercase letters, numbers, and hyphens.');
      return;
    }

    if (!startDate || !endDate) {
      setError('Start and end dates are required');
      return;
    }

    if (new Date(startDate) > new Date(endDate)) {
      setError('End date must be after start date');
      return;
    }

    try {
      setIsCreating(true);

      // Get Firebase token
      const token = await getFirebaseToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create event via API
      const response = await fetch('/api/events', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: eventName.trim(),
          slug: eventSlug.trim(),
          description: description.trim() || undefined,
          organizationId: org.id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          submissionDeadline: submissionDeadline ? new Date(submissionDeadline).toISOString() : undefined,
          visibility,
          status: 'upcoming',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create event');
      }

      const data = await response.json();

      // Redirect to event page
      router.push(`/e/${data.slug}`);
    } catch (err: any) {
      console.error('Event creation error:', err);
      setError(err.message || 'Failed to create event');
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/${slug}/events`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Create New Event</h1>
        <p className="text-zinc-400">
          Set up a new buildathon event for {org.name}
        </p>
      </div>

      {/* Form */}
      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Event Name */}
          <div>
            <label htmlFor="eventName" className="block text-sm font-medium text-white mb-2">
              Event Name <span className="text-red-400">*</span>
            </label>
            <input
              id="eventName"
              type="text"
              value={eventName}
              onChange={(e) => setEventName(e.target.value)}
              placeholder="My Awesome Buildathon"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
              required
              disabled={isCreating}
            />
          </div>

          {/* Event Slug */}
          <div>
            <label htmlFor="eventSlug" className="block text-sm font-medium text-white mb-2">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm">buildathon.live/e/</span>
              <input
                id="eventSlug"
                type="text"
                value={eventSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="my-awesome-buildathon"
                className="flex-1 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
                required
                disabled={isCreating}
              />
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              Lowercase letters, numbers, and hyphens only
            </p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe your buildathon event..."
              rows={3}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors resize-none"
              disabled={isCreating}
            />
          </div>

          {/* Dates */}
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="startDate" className="block text-sm font-medium text-white mb-2">
                Start Date <span className="text-red-400">*</span>
              </label>
              <input
                id="startDate"
                type="datetime-local"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                required
                disabled={isCreating}
              />
            </div>
            <div>
              <label htmlFor="endDate" className="block text-sm font-medium text-white mb-2">
                End Date <span className="text-red-400">*</span>
              </label>
              <input
                id="endDate"
                type="datetime-local"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                required
                disabled={isCreating}
              />
            </div>
          </div>

          {/* Submission Deadline */}
          <div>
            <label htmlFor="submissionDeadline" className="block text-sm font-medium text-white mb-2">
              Submission Deadline
            </label>
            <input
              id="submissionDeadline"
              type="datetime-local"
              value={submissionDeadline}
              onChange={(e) => setSubmissionDeadline(e.target.value)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
              disabled={isCreating}
            />
            <p className="text-xs text-zinc-500 mt-1">
              Leave empty to use end date as submission deadline
            </p>
          </div>

          {/* Visibility */}
          <div>
            <label htmlFor="visibility" className="block text-sm font-medium text-white mb-2">
              Visibility
            </label>
            <select
              id="visibility"
              value={visibility}
              onChange={(e) => setVisibility(e.target.value as any)}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
              disabled={isCreating}
            >
              <option value="public">Public - Listed on discovery portal</option>
              <option value="unlisted">Unlisted - Accessible via direct link</option>
              <option value="private">Private - Only visible to organization members</option>
            </select>
          </div>

          {/* Submit Button */}
          <div className="flex items-center gap-3 pt-4">
            <Link href={`/dashboard/${slug}/events`} className="flex-1">
              <Button type="button" variant="ghost" size="lg" className="w-full" disabled={isCreating}>
                Cancel
              </Button>
            </Link>
            <Button
              type="submit"
              size="lg"
              className="flex-1"
              disabled={isCreating}
            >
              {isCreating ? (
                <>
                  <Loader2 size={20} className="mr-2 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  Create Event
                  <ArrowRight size={20} className="ml-2" />
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>

      <div className="text-center text-sm text-zinc-500">
        <p>You can add themes and customize settings after creation</p>
      </div>
    </div>
  );
}
