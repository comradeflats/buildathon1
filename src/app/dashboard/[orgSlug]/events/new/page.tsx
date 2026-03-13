'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Calendar, ArrowLeft, ArrowRight, MapPin, Users, Star } from 'lucide-react';
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

  const { permissions, isLoading: permsLoading, orgId: fetchedOrgId } = useOrgPermissions(org?.id);

  const [isGettingLocation, setIsGettingLocation] = useState(false);

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setError('Geolocation is not supported by your browser');
      return;
    }

    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLat(position.coords.latitude.toString());
        setLng(position.coords.longitude.toString());
        setIsGettingLocation(false);
        // We could also reverse geocode here if we had an API key
      },
      (err) => {
        console.error('Error getting location:', err);
        setError('Failed to get your current location');
        setIsGettingLocation(false);
      }
    );
  };

  // Form state
  const [eventName, setEventName] = useState('');
  const [eventSlug, setEventSlug] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [region, setRegion] = useState('');
  const [address, setAddress] = useState('');
  const [lat, setLat] = useState('');
  const [lng, setLng] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [submissionDeadline, setSubmissionDeadline] = useState('');
  const [maxParticipants, setMaxParticipants] = useState('50');
  const [votingModel, setVotingModel] = useState<'peer' | 'expert'>('peer');
  const [visibility, setVisibility] = useState<'public' | 'unlisted' | 'private'>('public');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const isLoading = authLoading || orgsLoading || permsLoading || !org;

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
    // Only redirect if:
    // 1. We have an organization
    // 2. The permissions have finished loading
    // 3. The permissions we have match the organization ID we are currently looking at
    // 4. And after all that, we don't have manage permissions
    if (org && !permsLoading && fetchedOrgId === org.id && !permissions.canManageEvents) {
      router.push(`/dashboard/${slug}`);
    }
  }, [permissions, permsLoading, org, slug, router, fetchedOrgId]);

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
          location: location.trim() || undefined,
          region: region || undefined,
          address: address.trim() || undefined,
          coordinates: lat && lng ? { lat: parseFloat(lat), lng: parseFloat(lng) } : undefined,
          organizationId: org.id,
          startDate: new Date(startDate).toISOString(),
          endDate: new Date(endDate).toISOString(),
          submissionDeadline: submissionDeadline ? new Date(submissionDeadline).toISOString() : undefined,
          maxParticipants: parseInt(maxParticipants) || 50,
          isRegistrationOpen: true,
          votingModel,
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

          {/* Location Info */}
          <div className="space-y-4 p-4 bg-zinc-900/50 rounded-xl border border-zinc-800">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Location (Face to Face)</h3>
              <Button 
                type="button" 
                variant="secondary" 
                size="sm" 
                onClick={getCurrentLocation}
                disabled={isGettingLocation || isCreating}
                className="text-xs h-8 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 text-emerald-400"
              >
                {isGettingLocation ? (
                  <Loader2 size={12} className="mr-2 animate-spin" />
                ) : (
                  <MapPin size={12} className="mr-2" />
                )}
                Use My Location
              </Button>
            </div>
            
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="location" className="block text-sm font-medium text-zinc-300 mb-2">
                  City / Venue Name
                </label>
                <input
                  id="location"
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Da Nang, Enouvo Space"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label htmlFor="region" className="block text-sm font-medium text-zinc-300 mb-2">
                  Global Region
                </label>
                <select
                  id="region"
                  value={region}
                  onChange={(e) => setRegion(e.target.value)}
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                  disabled={isCreating}
                >
                  <option value="">Select a region...</option>
                  <option value="SE Asia">SE Asia</option>
                  <option value="East Asia">East Asia</option>
                  <option value="South Asia">South Asia</option>
                  <option value="Europe">Europe</option>
                  <option value="North America">North America</option>
                  <option value="South America">South America</option>
                  <option value="Africa">Africa</option>
                  <option value="Oceania">Oceania</option>
                  <option value="Middle East">Middle East</option>
                  <option value="Remote">Remote / Global</option>
                </select>
              </div>
            </div>

            <div>
              <label htmlFor="address" className="block text-sm font-medium text-zinc-300 mb-2">
                Full Physical Address
              </label>
              <input
                id="address"
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="123 Example St, Da Nang, Vietnam"
                className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
                disabled={isCreating}
              />
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="lat" className="block text-sm font-medium text-zinc-300 mb-2">
                  Latitude (Optional)
                </label>
                <input
                  id="lat"
                  type="number"
                  step="any"
                  value={lat}
                  onChange={(e) => setLat(e.target.value)}
                  placeholder="16.0471"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
                  disabled={isCreating}
                />
              </div>
              <div>
                <label htmlFor="lng" className="block text-sm font-medium text-zinc-300 mb-2">
                  Longitude (Optional)
                </label>
                <input
                  id="lng"
                  type="number"
                  step="any"
                  value={lng}
                  onChange={(e) => setLng(e.target.value)}
                  placeholder="108.2068"
                  className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
                  disabled={isCreating}
                />
              </div>
            </div>
            <p className="text-[10px] text-zinc-500">Coordinates are used to place your event on the global discovery map.</p>
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

          {/* Max Participants */}
          <div>
            <label htmlFor="maxParticipants" className="block text-sm font-medium text-white mb-2">
              Maximum Participants <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-3">
              <input
                id="maxParticipants"
                type="number"
                min="1"
                max="1000"
                value={maxParticipants}
                onChange={(e) => setMaxParticipants(e.target.value)}
                className="w-32 px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white focus:outline-none focus:border-accent transition-colors"
                required
                disabled={isCreating}
              />
              <span className="text-zinc-500 text-sm">
                Participants can join until this cap is reached. Others go to waitlist.
              </span>
            </div>
          </div>

          {/* Voting Model */}
          <div className="p-6 bg-zinc-900/50 rounded-xl border border-zinc-800 space-y-4">
            <h3 className="text-sm font-bold text-accent uppercase tracking-wider">Judging & Voting</h3>
            
            <div className="grid sm:grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setVotingModel('peer')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  votingModel === 'peer'
                    ? 'border-accent bg-accent/10'
                    : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Users size={18} className={votingModel === 'peer' ? 'text-accent' : 'text-zinc-400'} />
                  <h4 className="font-semibold text-white">Peer Voting</h4>
                </div>
                <p className="text-xs text-zinc-500">
                  Participants vote on each other's projects. Requires submitting a project to vote.
                </p>
              </button>

              <button
                type="button"
                onClick={() => setVotingModel('expert')}
                className={`p-4 rounded-lg border text-left transition-all ${
                  votingModel === 'expert'
                    ? 'border-accent bg-accent/10'
                    : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
                }`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <Star size={18} className={votingModel === 'expert' ? 'text-accent' : 'text-zinc-400'} />
                  <h4 className="font-semibold text-white">Expert Judging</h4>
                </div>
                <p className="text-xs text-zinc-500">
                  Designate specific "Judge" roles within your organization to score projects.
                </p>
              </button>
            </div>
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
