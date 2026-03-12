'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2, Building2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { createSlug, validateSlug } from '@/lib/slugs';

export default function OnboardingPage() {
  const router = useRouter();
  const { user, isLoading: authLoading, userProfile, getFirebaseToken } = useAuth();

  const [orgName, setOrgName] = useState('');
  const [orgSlug, setOrgSlug] = useState('');
  const [description, setDescription] = useState('');
  const [location, setLocation] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [slugTouched, setSlugTouched] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-generate slug from organization name
  useEffect(() => {
    if (!slugTouched && orgName) {
      setOrgSlug(createSlug(orgName));
    }
  }, [orgName, slugTouched]);

  // Redirect if user is already an organizer
  useEffect(() => {
    if (userProfile && (userProfile.isOrganizer || (userProfile.organizationIds?.length || 0) > 0)) {
      router.push('/dashboard');
    }
  }, [userProfile, router]);

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    setOrgSlug(value.toLowerCase().replace(/[^a-z0-9-]/g, ''));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    // Validation
    if (!orgName.trim()) {
      setError('Organization name is required');
      return;
    }

    if (!orgSlug.trim()) {
      setError('Organization slug is required');
      return;
    }

    if (!validateSlug(orgSlug)) {
      setError('Invalid slug format. Use only lowercase letters, numbers, and hyphens.');
      return;
    }

    try {
      setIsCreating(true);

      // Get Firebase token
      const token = await getFirebaseToken();
      if (!token) {
        throw new Error('Not authenticated');
      }

      // Create organization via API
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: orgName.trim(),
          slug: orgSlug.trim(),
          description: description.trim() || undefined,
          location: location.trim() || undefined,
          websiteUrl: websiteUrl.trim() || undefined,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create organization');
      }

      const data = await response.json();

      // Redirect to dashboard
      router.push(`/dashboard/${data.slug}`);
    } catch (err: any) {
      console.error('Organization creation error:', err);
      setError(err.message || 'Failed to create organization');
      setIsCreating(false);
    }
  };

  if (authLoading || !user) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto py-12">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-accent/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <Building2 className="text-accent" size={32} />
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">
          Create Your Organization
        </h1>
        <p className="text-zinc-400">
          Set up your organization to start hosting buildathon events
        </p>
      </div>

      <Card className="p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}

          {/* Organization Name */}
          <div>
            <label htmlFor="orgName" className="block text-sm font-medium text-white mb-2">
              Organization Name <span className="text-red-400">*</span>
            </label>
            <input
              id="orgName"
              type="text"
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="Acme Inc"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
              required
              disabled={isCreating}
            />
          </div>

          {/* Organization Slug */}
          <div>
            <label htmlFor="orgSlug" className="block text-sm font-medium text-white mb-2">
              URL Slug <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-2">
              <span className="text-zinc-500 text-sm">buildathon.live/org/</span>
              <input
                id="orgSlug"
                type="text"
                value={orgSlug}
                onChange={(e) => handleSlugChange(e.target.value)}
                placeholder="acme-inc"
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
              placeholder="Tell us about your organization..."
              rows={3}
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors resize-none"
              disabled={isCreating}
            />
          </div>

          {/* Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-white mb-2">
              Primary Location
            </label>
            <input
              id="location"
              type="text"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              placeholder="e.g. Da Nang, Vietnam"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
              disabled={isCreating}
            />
          </div>

          {/* Website URL */}
          <div>
            <label htmlFor="websiteUrl" className="block text-sm font-medium text-white mb-2">
              Website URL
            </label>
            <input
              id="websiteUrl"
              type="url"
              value={websiteUrl}
              onChange={(e) => setWebsiteUrl(e.target.value)}
              placeholder="https://acme.com"
              className="w-full px-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
              disabled={isCreating}
            />
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            size="lg"
            className="w-full"
            disabled={isCreating}
          >
            {isCreating ? (
              <>
                <Loader2 size={20} className="mr-2 animate-spin" />
                Creating Organization...
              </>
            ) : (
              <>
                Create Organization
                <ArrowRight size={20} className="ml-2" />
              </>
            )}
          </Button>
        </form>
      </Card>

      <div className="mt-6 text-center text-sm text-zinc-500">
        <p>You can invite team members and customize settings after creation</p>
      </div>
    </div>
  );
}
