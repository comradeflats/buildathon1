'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Github, Loader2, Star, GitFork, ExternalLink, AlertCircle } from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ThemeSelector } from './ThemeSelector';
import { useVoting } from '@/context/VotingContext';
import { parseGitHubUrl, fetchGitHubRepoFromUrl } from '@/lib/github';
import { GitHubRepoData, Team } from '@/lib/types';

interface GitHubSubmissionFormProps {
  initialTeam?: Team;
}

export function GitHubSubmissionForm({ initialTeam }: GitHubSubmissionFormProps) {
  const router = useRouter();
  const { themes, addTeam, updateTeam, showToast } = useVoting();

  const [githubUrl, setGithubUrl] = useState(initialTeam?.githubUrl || '');
  const [isFetching, setIsFetching] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [repoData, setRepoData] = useState<GitHubRepoData | null>(initialTeam?.githubData || null);

  const [deploymentUrl, setDeploymentUrl] = useState(initialTeam?.deploymentUrl || '');
  const [description, setDescription] = useState(initialTeam?.description || '');
  const [teamName, setTeamName] = useState(initialTeam?.name || '');
  const [projectName, setProjectName] = useState(initialTeam?.projectName || '');
  const [members, setMembers] = useState(initialTeam?.members.join(', ') || '');
  const [selectedThemeId, setSelectedThemeId] = useState(initialTeam?.themeId || '');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditMode = !!initialTeam;

  const handleFetchRepo = async () => {
    if (!githubUrl.trim()) {
      setFetchError('Please enter a GitHub URL');
      return;
    }

    const parsed = parseGitHubUrl(githubUrl);
    if (!parsed) {
      setFetchError('Invalid GitHub URL format. Expected: github.com/owner/repo');
      return;
    }

    setIsFetching(true);
    setFetchError(null);
    setRepoData(null);

    try {
      const data = await fetchGitHubRepoFromUrl(githubUrl);
      setRepoData(data);
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
      setFetchError(err instanceof Error ? err.message : 'Failed to fetch repository');
    } finally {
      setIsFetching(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!repoData) {
      showToast('Please fetch a GitHub repository first', 'error');
      return;
    }

    if (!selectedThemeId) {
      showToast('Please select a theme', 'error');
      return;
    }

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    const teamData: Team = {
      id: initialTeam?.id || uuidv4(),
      name: teamName || repoData.fullName.split('/')[0] || 'Team',
      projectName: projectName || repoData.fullName.split('/')[1] || repoData.fullName,
      description: description || repoData.description || 'No description provided',
      members: members
        .split(',')
        .map((m) => m.trim())
        .filter(Boolean),
      techStack: repoData.topics.length > 0
        ? repoData.topics.slice(0, 5)
        : repoData.language
          ? [repoData.language]
          : [],
      themeId: selectedThemeId,
      githubUrl: githubUrl.trim(),
      githubData: repoData,
      deploymentUrl: deploymentUrl.trim(),
    };

    try {
      if (isEditMode) {
        await updateTeam(teamData);
        showToast(`${teamData.projectName} updated!`, 'success');
      } else {
        await addTeam(teamData);
        showToast(`${teamData.projectName} added to competition!`, 'success');
      }
      router.push('/');
    } catch (err) {
      showToast('Failed to save project. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid = repoData && selectedThemeId;

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* GitHub URL Input */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <Github size={20} />
          GitHub Repository
        </h2>

        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3">
            <input
              type="text"
              value={githubUrl}
              onChange={(e) => {
                setGithubUrl(e.target.value);
                setFetchError(null);
              }}
              placeholder="https://github.com/owner/repo"
              className="flex-1 bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent text-sm"
            />
            <Button
              type="button"
              onClick={handleFetchRepo}
              disabled={isFetching}
              className="shrink-0 h-12 sm:h-auto"
            >
              {isFetching ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                'Fetch'
              )}
            </Button>
          </div>

          {fetchError && (
            <div className="flex items-start gap-2 text-red-400 text-sm">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <span>{fetchError}</span>
            </div>
          )}
        </div>
      </Card>

      {/* Repository Preview */}
      {repoData && (
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
                href={githubUrl}
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

      {/* Theme Selection */}
      <Card className="p-6">
        <h2 className="text-lg font-semibold text-white mb-4">Competition Theme</h2>
        <ThemeSelector
          themes={themes}
          selectedThemeId={selectedThemeId}
          onChange={setSelectedThemeId}
        />
      </Card>

      {/* Team Details (Optional Override) */}
      {repoData && (
        <Card className="p-6">
          <h2 className="text-lg font-semibold text-white mb-4">Team Details (Optional)</h2>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Project Name
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
                Project Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Briefly describe your project..."
                rows={3}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-zinc-400 mb-2">
                Team Name
              </label>
              <input
                type="text"
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder={repoData.fullName.split('/')[0] || 'Team name'}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 text-white placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent"
              />
            </div>

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

      {!isFormValid && repoData && (
        <p className="text-sm text-zinc-500 text-center">
          Please select a theme to continue
        </p>
      )}
    </form>
  );
}
