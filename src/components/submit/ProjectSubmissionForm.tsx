'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Loader2, Star, GitFork, ExternalLink, AlertCircle, Calendar, Globe, Link, CheckCircle, ChevronDown } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ThemeSelector } from './ThemeSelector';
import { EventSelector } from './EventSelector';
import { useVoting } from '@/context/VotingContext';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/context/AuthContext';
import { parseGitHubUrl, fetchGitHubRepoFromUrl, ensureAbsoluteUrl } from '@/lib/github';
import { addTeamToOwnership } from '@/lib/indexeddb';
import { GitHubRepoData, Team, SubmissionUrlType } from '@/lib/types';
import { detectUrlType, validateUrl, getUrlTypeInfo } from '@/lib/urls';

interface ProjectSubmissionFormProps {
  initialTeam?: Team;
  preselectedEventId?: string;
  preselectedThemeId?: string;
}

export function ProjectSubmissionForm({ initialTeam, preselectedEventId, preselectedThemeId }: ProjectSubmissionFormProps) {
  const router = useRouter();
  const { themes, addTeam, updateTeam, showToast } = useVoting();
  const { events, getEventsForSubmission } = useEvents();
  const { user, isAnonymous, ensureOwnershipToken } = useAuth();

  // URL and type state
  const [primaryUrl, setPrimaryUrl] = useState(initialTeam?.primaryUrl || initialTeam?.githubUrl || '');
  const [urlType, setUrlType] = useState<SubmissionUrlType>(initialTeam?.urlType || (initialTeam?.githubUrl ? 'github' : 'general'));
  const [showTypeDropdown, setShowTypeDropdown] = useState(false);
  const [urlValidated, setUrlValidated] = useState(!!initialTeam);
  const [urlError, setUrlError] = useState<string | null>(null);

  // GitHub-specific state
  const [isFetching, setIsFetching] = useState(false);
  const [repoData, setRepoData] = useState<GitHubRepoData | null>(initialTeam?.githubData || null);

  const [deploymentUrl, setDeploymentUrl] = useState(initialTeam?.deploymentUrl || '');
  const [description, setDescription] = useState(initialTeam?.description || '');
  const [teamName, setTeamName] = useState(initialTeam?.name || '');
  const [projectName, setProjectName] = useState(initialTeam?.projectName || '');
  const [members, setMembers] = useState(initialTeam?.members.join(', ') || '');
  const [selectedEventId, setSelectedEventId] = useState(initialTeam?.eventId || preselectedEventId || '');
  const [selectedThemeId, setSelectedThemeId] = useState(initialTeam?.themeId || preselectedThemeId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialTeam;
  const urlTypeInfo = getUrlTypeInfo(urlType);

  // Get available events for submission
  const availableEvents = useMemo(() => getEventsForSubmission(), [getEventsForSubmission]);

  // Filter themes by selected event
  const eventThemes = useMemo(() => {
    if (!selectedEventId) return themes;
    return themes.filter((theme) => theme.eventId === selectedEventId);
  }, [themes, selectedEventId]);

  // Clear theme selection when event changes (unless it's still valid)
  const handleEventChange = (eventId: string) => {
    setSelectedEventId(eventId);
    // Reset theme if it doesn't belong to the new event
    const themeStillValid = themes.some(
      (t) => t.id === selectedThemeId && t.eventId === eventId
    );
    if (!themeStillValid) {
      setSelectedThemeId('');
    }
  };

  // Auto-detect URL type when URL changes
  const handleUrlChange = (url: string) => {
    setPrimaryUrl(url);
    setUrlError(null);
    setUrlValidated(false);
    setRepoData(null);

    if (url.trim()) {
      const detected = detectUrlType(url);
      setUrlType(detected);
    }
  };

  // Validate URL (and fetch GitHub data if applicable)
  const handleValidateUrl = async () => {
    if (!primaryUrl.trim()) {
      setUrlError('Please enter a URL');
      return;
    }

    const validation = validateUrl(primaryUrl, urlType);
    if (!validation.valid) {
      setUrlError(validation.error || 'Invalid URL');
      return;
    }

    // For GitHub URLs, fetch repo data
    if (urlType === 'github') {
      const parsed = parseGitHubUrl(primaryUrl);
      if (!parsed) {
        setUrlError('Invalid GitHub URL format. Expected: github.com/owner/repo');
        return;
      }

      setIsFetching(true);
      setUrlError(null);
      setRepoData(null);

      try {
        const data = await fetchGitHubRepoFromUrl(primaryUrl);
        setRepoData(data);
        setUrlValidated(true);
        // Pre-fill fields from repo name
        const parts = data.fullName.split('/');
        if (!teamName) {
          setTeamName(parts[0] || '');
        }
        if (!projectName) {
          setProjectName(parts[1] || parts[0] || '');
        }
        if (!description && data.description) {
          setDescription(data.description);
        }
      } catch (err) {
        setUrlError(err instanceof Error ? err.message : 'Failed to fetch repository');
      } finally {
        setIsFetching(false);
      }
    } else {
      // For non-GitHub URLs, just validate
      setUrlValidated(true);
      setUrlError(null);
    }
  };

  // Handle manual URL type change
  const handleUrlTypeChange = (type: SubmissionUrlType) => {
    setUrlType(type);
    setShowTypeDropdown(false);
    setUrlValidated(false);
    setRepoData(null);
    setUrlError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!urlValidated) {
      showToast('Please validate your URL first', 'error');
      return;
    }

    // For non-GitHub URLs, description is required
    if (urlType !== 'github' && !description.trim()) {
      showToast('Please provide a project description', 'error');
      return;
    }

    if (!selectedEventId) {
      showToast('Please select an event', 'error');
      return;
    }

    if (!selectedThemeId) {
      showToast('Please select a theme', 'error');
      return;
    }

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    // Determine ownership
    let ownerId: string | null = null;
    let ownershipToken: string | null = null;
    let ownerDisplayName: string | null = null;

    if (user && !isAnonymous) {
      // Signed in with GitHub - use Firebase UID
      ownerId = user.uid;
      ownerDisplayName = user.displayName || user.email || 'GitHub User';
    } else {
      // Anonymous or not signed in - use IndexedDB token
      ownershipToken = await ensureOwnershipToken();
      ownerDisplayName = 'Anonymous';
    }

    const now = new Date().toISOString();

    // Determine team/project names based on URL type
    const defaultTeamName = urlType === 'github' && repoData
      ? repoData.fullName.split('/')[0]
      : 'Team';
    const defaultProjectName = urlType === 'github' && repoData
      ? repoData.fullName.split('/')[1] || repoData.fullName
      : projectName || 'Project';
    const defaultDescription = urlType === 'github' && repoData?.description
      ? repoData.description
      : description || 'No description provided';

    // Determine tech stack
    const techStack = urlType === 'github' && repoData
      ? (repoData.topics.length > 0
          ? repoData.topics.slice(0, 5)
          : repoData.language
            ? [repoData.language]
            : [])
      : [];

    // Build team data object, adding optional fields only if they have values
    // (Firebase doesn't accept undefined values)
    const teamData: Team = {
      id: initialTeam?.id || uuidv4(),
      name: teamName || defaultTeamName,
      projectName: projectName || defaultProjectName,
      description: description || defaultDescription,
      members: members
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      techStack,
      themeId: selectedThemeId,
      eventId: selectedEventId,
      // New multi-URL fields
      primaryUrl: primaryUrl.trim(),
      urlType,
      // Preserve existing ownership for edits, or set new ownership for new submissions
      ownerId: isEditMode ? (initialTeam?.ownerId ?? ownerId) : ownerId,
      ownershipToken: isEditMode ? (initialTeam?.ownershipToken ?? ownershipToken) : ownershipToken,
      ownerDisplayName: isEditMode ? (initialTeam?.ownerDisplayName ?? ownerDisplayName) : ownerDisplayName,
      createdAt: initialTeam?.createdAt || now,
      updatedAt: now,
    };

    // Add optional fields only if they have values (Firebase doesn't accept undefined)
    if (urlType === 'github') {
      teamData.githubUrl = primaryUrl.trim();
      if (repoData) {
        teamData.githubData = repoData;
      }
    }
    if (deploymentUrl.trim()) {
      teamData.deploymentUrl = deploymentUrl.trim();
    }

    try {
      if (isEditMode) {
        await updateTeam(teamData);
        showToast(`${teamData.projectName} updated!`, 'success');
      } else {
        await addTeam(teamData);
        // Track in IndexedDB for anonymous users
        if (ownershipToken) {
          await addTeamToOwnership(teamData.id);
        }
        showToast(`${teamData.projectName} added to competition!`, 'success');
      }
      // Redirect to event gallery instead of home
      router.push(`/events/${selectedEventId}`);
    } catch (err) {
      showToast('Failed to save project. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Form is valid if URL is validated, event and theme are selected
  // For non-GitHub, description is also required
  const isFormValid = urlValidated && selectedEventId && selectedThemeId &&
    (urlType === 'github' || description.trim());

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Submission Type Intro - Show only when URL not yet entered */}
      {!primaryUrl.trim() && !isEditMode && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-2">What are you submitting?</h2>
          <p className="text-sm text-zinc-400 mb-4">Choose how you want to share your project</p>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => handleUrlTypeChange('github')}
              className={`p-4 rounded-lg border text-left transition-all ${
                urlType === 'github'
                  ? 'border-accent bg-accent/10'
                  : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <Github size={24} className={urlType === 'github' ? 'text-accent' : 'text-zinc-400'} />
              <h3 className="font-medium text-white mt-2">GitHub Repo</h3>
              <p className="text-xs text-zinc-500 mt-1">Source code repository</p>
            </button>

            <button
              type="button"
              onClick={() => handleUrlTypeChange('website')}
              className={`p-4 rounded-lg border text-left transition-all ${
                urlType === 'website'
                  ? 'border-emerald-500 bg-emerald-500/10'
                  : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <Globe size={24} className={urlType === 'website' ? 'text-emerald-400' : 'text-zinc-400'} />
              <h3 className="font-medium text-white mt-2">Website / Demo</h3>
              <p className="text-xs text-zinc-500 mt-1">Deployed app or demo</p>
            </button>

            <button
              type="button"
              onClick={() => handleUrlTypeChange('general')}
              className={`p-4 rounded-lg border text-left transition-all ${
                urlType === 'general'
                  ? 'border-blue-500 bg-blue-500/10'
                  : 'border-zinc-700 hover:border-zinc-600 hover:bg-zinc-800/50'
              }`}
            >
              <Link size={24} className={urlType === 'general' ? 'text-blue-400' : 'text-zinc-400'} />
              <h3 className="font-medium text-white mt-2">Any Link</h3>
              <p className="text-xs text-zinc-500 mt-1">Figma, Notion, video, etc.</p>
            </button>
          </div>
        </Card>
      )}

      {/* Project URL Input */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            {urlType === 'github' ? (
              <Github size={20} />
            ) : urlType === 'website' ? (
              <Globe size={20} />
            ) : (
              <Link size={20} />
            )}
            {urlTypeInfo.label}
          </h2>

          {/* URL Type Selector */}
          <div className="relative">
            <button
              type="button"
              onClick={() => setShowTypeDropdown(!showTypeDropdown)}
              className="flex items-center gap-1 text-xs text-zinc-400 hover:text-white transition-colors px-2 py-1 rounded border border-zinc-700 hover:border-zinc-600"
            >
              Change Type
              <ChevronDown size={12} />
            </button>

            {showTypeDropdown && (
              <div className="absolute right-0 top-full mt-1 bg-zinc-800 border border-zinc-700 rounded-lg shadow-lg z-10 min-w-[160px]">
                <button
                  type="button"
                  onClick={() => handleUrlTypeChange('github')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors ${urlType === 'github' ? 'text-accent' : 'text-white'}`}
                >
                  <Github size={14} />
                  GitHub Repo
                </button>
                <button
                  type="button"
                  onClick={() => handleUrlTypeChange('website')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors ${urlType === 'website' ? 'text-accent' : 'text-white'}`}
                >
                  <Globe size={14} />
                  Website / Demo
                </button>
                <button
                  type="button"
                  onClick={() => handleUrlTypeChange('general')}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left hover:bg-zinc-700 transition-colors ${urlType === 'general' ? 'text-accent' : 'text-white'}`}
                >
                  <Link size={14} />
                  Any Link
                </button>
              </div>
            )}
          </div>
        </div>

        <p className="text-xs text-zinc-500 mb-4">{urlTypeInfo.description}</p>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <input
                type="text"
                value={primaryUrl}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder={urlTypeInfo.placeholder}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
              />
              {urlValidated && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <CheckCircle size={18} className="text-emerald-400" />
                </div>
              )}
            </div>
            <Button
              type="button"
              onClick={handleValidateUrl}
              disabled={isFetching || !primaryUrl.trim()}
              className="shrink-0 h-12 sm:h-auto"
            >
              {isFetching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : urlType === 'github' ? (
                'Fetch'
              ) : (
                'Validate'
              )}
            </Button>
          </div>

          {/* Auto-detected type indicator */}
          {primaryUrl && !urlValidated && (
            <div className="flex items-center gap-2 text-xs text-zinc-500">
              <span>Detected as:</span>
              <Badge variant="outline" className="text-[10px] py-0">
                {urlType === 'github' && <Github size={10} className="mr-1" />}
                {urlType === 'website' && <Globe size={10} className="mr-1" />}
                {urlType === 'general' && <Link size={10} className="mr-1" />}
                {urlTypeInfo.label}
              </Badge>
            </div>
          )}

          {urlError && (
            <div className="flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{urlError}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Repository Preview (GitHub only) */}
      {urlType === 'github' && repoData && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Repository Preview</h2>

          <div className="space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-xl font-bold text-white">{repoData.fullName}</h3>
                <p className="text-zinc-400 mt-1">
                  {repoData.description || 'No description'}
                </p>
              </div>
              <a
                href={ensureAbsoluteUrl(primaryUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-zinc-400 hover:text-white transition-colors"
              >
                <ExternalLink size={20} />
              </a>
            </div>

            <div className="flex flex-wrap gap-3">
              {repoData.language && (
                <Badge>{repoData.language}</Badge>
              )}
              <Badge variant="secondary">
                <Star size={12} className="mr-1" />
                {repoData.stars}
              </Badge>
              <Badge variant="secondary">
                <GitFork size={12} className="mr-1" />
                {repoData.forks}
              </Badge>
            </div>

            {repoData.topics.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {repoData.topics.slice(0, 6).map((topic) => (
                  <Badge key={topic} variant="outline">
                    {topic}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </Card>
      )}

      {/* URL Validated Indicator (non-GitHub) */}
      {urlType !== 'github' && urlValidated && (
        <Card className="p-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg">
              <CheckCircle size={24} className="text-emerald-400" />
            </div>
            <div>
              <h3 className="text-white font-medium">URL Validated</h3>
              <a
                href={ensureAbsoluteUrl(primaryUrl)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-accent hover:underline flex items-center gap-1"
              >
                {primaryUrl}
                <ExternalLink size={12} />
              </a>
            </div>
          </div>
        </Card>
      )}

      {/* Event Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Calendar size={20} />
          Select Event
        </h2>
        <EventSelector
          events={availableEvents}
          selectedEventId={selectedEventId}
          onChange={handleEventChange}
        />
      </Card>

      {/* Theme Selection */}
      {selectedEventId && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Competition Theme</h2>
          {eventThemes.length > 0 ? (
            <ThemeSelector
              themes={eventThemes}
              selectedThemeId={selectedThemeId}
              onChange={setSelectedThemeId}
            />
          ) : (
            <p className="text-zinc-400 text-sm">
              No themes available for this event yet. An admin needs to generate themes first.
            </p>
          )}
        </Card>
      )}

      {/* Team Details */}
      {urlValidated && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            {urlType === 'github' ? 'Team Details (Optional)' : 'Project Details'}
          </h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Project Name {urlType !== 'github' && <span className="text-red-400">*</span>}
              </label>
              <input
                type="text"
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="Awesome Project"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Project Description {urlType !== 'github' && <span className="text-red-400">*</span>}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your project..."
                rows={3}
                className={`w-full bg-zinc-800 border rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none ${
                  urlType !== 'github' && !description.trim() ? 'border-zinc-600' : 'border-zinc-700'
                }`}
              />
              {urlType !== 'github' && (
                <p className="text-xs text-zinc-500 mt-1">
                  Description is required for non-GitHub submissions
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={urlType === 'github' && repoData ? repoData.fullName.split('/')[0] : 'Team name'}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

            {/* Only show Deployment URL for GitHub submissions (others are already a deployment URL) */}
            {urlType === 'github' && (
              <div>
                <label className="block text-sm font-medium text-zinc-400 mb-2">
                  Deployment URL (optional)
                </label>
                <input
                  type="url"
                  value={deploymentUrl}
                  onChange={(e) => setDeploymentUrl(e.target.value)}
                  placeholder="https://your-project.vercel.app"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Team Members (comma-separated)
              </label>
              <input
                type="text"
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                placeholder="Alice, Bob, Charlie"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>
          </div>
        </Card>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        size="lg"
        disabled={!isFormValid || isSubmitting}
        className="w-full py-6 text-lg font-bold shadow-lg shadow-accent/20"
      >
        {isSubmitting ? (
          <>
            <Loader2 size={18} className="mr-2 animate-spin" />
            {isEditMode ? 'Updating Project...' : 'Adding Project...'}
          </>
        ) : (
          isEditMode ? 'Update Project Submission' : 'Add Project to Competition'
        )}
      </Button>

      {!isFormValid && urlValidated && (
        <p className="text-sm text-zinc-500 text-center">
          {!selectedEventId
            ? 'Please select an event to continue'
            : !selectedThemeId
              ? 'Please select a theme to continue'
              : urlType !== 'github' && !description.trim()
                ? 'Please provide a project description'
                : ''}
        </p>
      )}
    </form>
  );
}
