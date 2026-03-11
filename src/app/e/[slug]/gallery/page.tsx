'use client';

import { useState, useMemo, Suspense } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ArrowLeft, Loader2, Search, LayoutGrid } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { TeamCard } from '@/components/gallery/TeamCard';
import { ThemeFilterDropdown } from '@/components/gallery/ThemeFilterDropdown';
import { useEventBySlug } from '@/hooks/useEventBySlug';
import { useTeams } from '@/hooks/useTeams';
import { useThemes } from '@/hooks/useThemes';

function GalleryBySlugContent() {
  const params = useParams();
  const slug = params.slug as string;

  const { event, isLoading: isEventLoading } = useEventBySlug(slug);
  const { teams, isLoading: isTeamsLoading } = useTeams();
  const { themes, isLoading: isThemesLoading, getThemesByEventId } = useThemes();

  const [selectedThemeId, setSelectedThemeId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const isLoading = isEventLoading || isTeamsLoading || isThemesLoading;

  // Get themes for this event
  const availableThemes = useMemo(() => {
    if (!event) return [];
    return getThemesByEventId(event.id);
  }, [event, getThemesByEventId]);

  // Filter projects for this event
  const filteredProjects = useMemo(() => {
    if (!event) return [];

    return teams.filter((team) => {
      // Event filter
      if (team.eventId !== event.id) {
        return false;
      }

      // Theme filter
      if (selectedThemeId && team.themeId !== selectedThemeId) {
        return false;
      }

      // Search filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesProjectName = team.projectName?.toLowerCase().includes(query);
        const matchesTeamName = team.name?.toLowerCase().includes(query);
        const matchesDescription = team.description?.toLowerCase().includes(query);

        if (!matchesProjectName && !matchesTeamName && !matchesDescription) {
          return false;
        }
      }

      return true;
    });
  }, [teams, event, selectedThemeId, searchQuery]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <LayoutGrid size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Event Not Found</h2>
        <p className="text-zinc-400 mb-6">
          The event you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link
          href="/"
          className="text-accent hover:underline flex items-center gap-2"
        >
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <Link
          href={`/e/${slug}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to {event.name}
        </Link>

        <div className="flex items-center gap-3 mb-2">
          <LayoutGrid size={32} className="text-accent" />
          <h1 className="text-3xl font-bold text-white">Project Gallery</h1>
        </div>
        <p className="text-zinc-400">
          Browse all submitted projects for {event.name}
        </p>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="relative flex-1">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input
              type="text"
              placeholder="Search projects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:border-accent transition-colors"
            />
          </div>

          {/* Theme Filter */}
          <ThemeFilterDropdown
            themes={availableThemes}
            selectedThemeId={selectedThemeId}
            onChange={setSelectedThemeId}
          />
        </div>
      </Card>

      {/* Results Count */}
      <div className="text-sm text-zinc-400">
        Showing {filteredProjects.length} {filteredProjects.length === 1 ? 'project' : 'projects'}
        {selectedThemeId && ' with selected theme'}
        {searchQuery && ` matching "${searchQuery}"`}
      </div>

      {/* Projects Grid */}
      {filteredProjects.length === 0 ? (
        <Card className="p-12 text-center">
          <LayoutGrid size={48} className="mx-auto text-zinc-600 mb-4" />
          <h2 className="text-xl font-semibold text-white mb-2">No Projects Found</h2>
          <p className="text-zinc-400">
            {teams.filter(t => t.eventId === event.id).length === 0
              ? 'No projects have been submitted yet.'
              : 'Try adjusting your filters or search query.'}
          </p>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredProjects.map((team) => (
            <TeamCard key={team.id} team={team} />
          ))}
        </div>
      )}
    </div>
  );
}

export default function GalleryBySlugPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[60vh] flex items-center justify-center">
          <Loader2 size={32} className="animate-spin text-zinc-400" />
        </div>
      }
    >
      <GalleryBySlugContent />
    </Suspense>
  );
}
