export interface Event {
  id: string;
  name: string;
  description?: string;
  isActive: boolean;
  status: 'upcoming' | 'active' | 'archived';
  startDate: string;              // ISO date
  endDate: string;                // ISO date
  submissionDeadline?: string;    // ISO date
  keyboardsDownTime?: string;     // ISO datetime - when coding must stop
  createdAt: string;
  themesGenerated: boolean;
}

export interface Theme {
  id: string;
  name: string;
  emoji: string;
  iconKey?: string;
  iconColor?: string;
  concept: string;
  judgingCriteria: string[];
  eventId: string;
}

export interface GitHubRepoData {
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
  commitCount?: number;
}

export type SubmissionUrlType = 'github' | 'website' | 'general';

export interface Team {
  id: string;
  name: string;
  projectName: string;
  description: string;
  members: string[];
  techStack: string[];
  themeId: string;
  eventId: string;
  // New fields for multi-URL support
  primaryUrl?: string;
  urlType?: SubmissionUrlType;
  // Keep existing for backwards compatibility
  githubUrl?: string;
  githubData?: GitHubRepoData;
  deploymentUrl?: string;
  // Ownership fields
  ownerId?: string | null;       // GitHub UID for signed-in users
  ownershipToken?: string | null; // IndexedDB token for anonymous users
  ownerDisplayName?: string | null; // GitHub username or "Anonymous"
  createdAt?: string;            // ISO timestamp
  updatedAt?: string;            // ISO timestamp
}

export interface TeamsData {
  eventName: string;
  teams: Team[];
}

// Dynamic scores using criterion indices (0-4 for 5 criteria)
export interface Scores {
  [key: number]: number;
}

export interface Vote {
  id: string;
  teamId: string;
  judgeId: string;
  scores: Scores;
  isFavorite: boolean;
  submittedAt: string;
}

export interface TeamScore {
  teamId: string;
  team: Team;
  averageScores: Scores;
  totalAverage: number;
  voteCount: number;
  favoriteCount: number;
}

// Legacy type support for old data migration
export interface LegacyScores {
  creativeInterpretation: number;
  visualDesign: number;
  usability: number;
  utilityImpact: number;
  shipFactor: number;
}

export type CriterionKey = keyof LegacyScores;

export interface Criterion {
  key: CriterionKey;
  label: string;
  description: string;
}
