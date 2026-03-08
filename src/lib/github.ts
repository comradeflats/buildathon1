import { GitHubRepoData } from './types';

export interface ParsedGitHubUrl {
  owner: string;
  repo: string;
}

/**
 * Parse a GitHub URL to extract owner and repo name
 * Supports formats:
 * - https://github.com/owner/repo
 * - http://github.com/owner/repo
 * - github.com/owner/repo
 * - https://github.com/owner/repo.git
 * - https://github.com/owner/repo/tree/branch
 */
export function parseGitHubUrl(url: string): ParsedGitHubUrl | null {
  if (!url) return null;

  // Normalize the URL
  let normalized = url.trim();

  // Remove protocol if present
  normalized = normalized.replace(/^https?:\/\//, '');

  // Remove www. if present
  normalized = normalized.replace(/^www\./, '');

  // Check if it starts with github.com
  if (!normalized.startsWith('github.com/')) {
    return null;
  }

  // Remove github.com/
  normalized = normalized.replace('github.com/', '');

  // Split by / and get owner and repo
  const parts = normalized.split('/');

  if (parts.length < 2) {
    return null;
  }

  const owner = parts[0];
  let repo = parts[1];

  // Remove .git suffix if present
  repo = repo.replace(/\.git$/, '');

  // Remove any trailing paths (like /tree/branch, /blob/main, etc.)
  // by only taking the repo name before any additional slashes

  if (!owner || !repo) {
    return null;
  }

  return { owner, repo };
}

/**
 * Ensure a URL is absolute by adding https:// if missing.
 */
export function ensureAbsoluteUrl(url: string): string {
  if (!url) return url;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  return `https://${url}`;
}

/**
 * Fetch repository data from GitHub API
 * Uses the public API (no authentication required for public repos)
 */
export async function fetchGitHubRepo(owner: string, repo: string): Promise<GitHubRepoData> {
  const response = await fetch(`https://api.github.com/repos/${owner}/${repo}`, {
    headers: {
      'Accept': 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    if (response.status === 404) {
      throw new Error('Repository not found. Make sure the URL is correct and the repo is public.');
    }
    if (response.status === 403) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
    throw new Error(`Failed to fetch repository: ${response.statusText}`);
  }

  const data = await response.json();

  return {
    fullName: data.full_name,
    description: data.description,
    language: data.language,
    stars: data.stargazers_count,
    forks: data.forks_count,
    topics: data.topics || [],
  };
}

/**
 * Fetch repo data directly from a GitHub URL
 */
export async function fetchGitHubRepoFromUrl(url: string): Promise<GitHubRepoData> {
  const parsed = parseGitHubUrl(url);

  if (!parsed) {
    throw new Error('Invalid GitHub URL format');
  }

  return fetchGitHubRepo(parsed.owner, parsed.repo);
}

/**
 * Generate a canonical GitHub URL from owner and repo
 */
export function getGitHubUrl(owner: string, repo: string): string {
  return `https://github.com/${owner}/${repo}`;
}
