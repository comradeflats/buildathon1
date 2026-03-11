import { SubmissionUrlType } from './types';

// Common deployment platform domains
const WEBSITE_DOMAINS = [
  'vercel.app',
  'netlify.app',
  'netlify.com',
  'herokuapp.com',
  'railway.app',
  'render.com',
  'fly.io',
  'cloudflare.com',
  'pages.dev',
  'surge.sh',
  'now.sh',
  'glitch.me',
  'replit.dev',
  'repl.co',
  'stackblitz.io',
  'codesandbox.io',
  'web.app',
  'firebaseapp.com',
  'github.io',
  'gitlab.io',
  'azurewebsites.net',
  'amplifyapp.com',
];

/**
 * Auto-detect URL type based on the URL pattern
 */
export function detectUrlType(url: string): SubmissionUrlType {
  if (!url) return 'general';

  const normalizedUrl = url.toLowerCase().trim();

  // Check for GitHub
  if (
    normalizedUrl.includes('github.com/') &&
    !normalizedUrl.includes('github.com/orgs') &&
    !normalizedUrl.includes('github.com/settings')
  ) {
    // Ensure it looks like a repo URL (has at least owner/repo pattern)
    const githubMatch = normalizedUrl.match(/github\.com\/([^/]+)\/([^/]+)/);
    if (githubMatch) {
      return 'github';
    }
  }

  // Check for known deployment platforms
  for (const domain of WEBSITE_DOMAINS) {
    if (normalizedUrl.includes(domain)) {
      return 'website';
    }
  }

  // Check for common website patterns (custom domains with http/https)
  try {
    const urlObj = new URL(normalizedUrl.startsWith('http') ? normalizedUrl : `https://${normalizedUrl}`);
    // If it has a valid hostname and looks like a deployed app, treat as website
    if (urlObj.hostname && urlObj.hostname.includes('.')) {
      // If it looks like a direct link to a specific resource, it's general
      const pathParts = urlObj.pathname.split('/').filter(Boolean);
      if (pathParts.length > 2) {
        return 'general';
      }
      return 'website';
    }
  } catch {
    // Invalid URL
  }

  return 'general';
}

/**
 * Validate URL format
 */
export function validateUrl(url: string, type?: SubmissionUrlType): { valid: boolean; error?: string } {
  if (!url || !url.trim()) {
    return { valid: false, error: 'URL is required' };
  }

  const trimmedUrl = url.trim();

  // Basic URL validation
  try {
    const urlToTest = trimmedUrl.startsWith('http') ? trimmedUrl : `https://${trimmedUrl}`;
    new URL(urlToTest);
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }

  // Type-specific validation
  const detectedType = type || detectUrlType(trimmedUrl);

  if (detectedType === 'github') {
    const githubMatch = trimmedUrl.match(/github\.com\/([^/]+)\/([^/]+)/i);
    if (!githubMatch) {
      return { valid: false, error: 'Invalid GitHub URL format. Expected: github.com/owner/repo' };
    }
  }

  return { valid: true };
}

export interface UrlTypeInfo {
  type: SubmissionUrlType;
  label: string;
  description: string;
  icon: 'github' | 'globe' | 'link';
  placeholder: string;
  requiresDescription: boolean;
}

/**
 * Get display information for a URL type
 */
export function getUrlTypeInfo(type: SubmissionUrlType): UrlTypeInfo {
  switch (type) {
    case 'github':
      return {
        type: 'github',
        label: 'GitHub Repository',
        description: 'Submit your source code repo. We\'ll auto-fetch project details and check commit timestamps.',
        icon: 'github',
        placeholder: 'https://github.com/owner/repo',
        requiresDescription: false,
      };
    case 'website':
      return {
        type: 'website',
        label: 'Website / Demo',
        description: 'Submit a deployed app, demo, or landing page. Perfect for no-code tools or hosted projects.',
        icon: 'globe',
        placeholder: 'https://your-app.vercel.app',
        requiresDescription: true,
      };
    case 'general':
      return {
        type: 'general',
        label: 'Any Link',
        description: 'Submit any URL: Figma prototype, Notion doc, video demo, or other project link.',
        icon: 'link',
        placeholder: 'https://figma.com/file/... or https://notion.so/...',
        requiresDescription: true,
      };
  }
}

/**
 * Get the appropriate link text for display
 */
export function getUrlLinkText(type?: SubmissionUrlType): string {
  switch (type) {
    case 'github':
      return 'View on GitHub';
    case 'website':
      return 'Visit Website';
    case 'general':
    default:
      return 'View Project';
  }
}

/**
 * Ensure URL has protocol
 */
export function ensureAbsoluteUrl(url: string): string {
  if (!url) return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://')) {
    return trimmed;
  }
  return `https://${trimmed}`;
}
