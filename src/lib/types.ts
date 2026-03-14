// Multi-tenant types
export interface Organization {
  id: string;
  name: string;
  slug: string;              // Unique identifier for URLs
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  location?: string;         // Primary location (e.g., "Da Nang, Vietnam")
  twitterUrl?: string;
  discordUrl?: string;
  createdAt: string;
  updatedAt: string;
  createdBy: string;         // Firebase UID
  memberCount: number;
  settings: {
    allowPublicEventDiscovery: boolean;
    branding?: {
      primaryColor?: string;
      accentColor?: string;
      bannerUrl?: string;
      customFont?: string;
    };
    accessControl?: {
      inviteLinkEnabled: boolean;
      inviteLinkCode?: string;
      defaultRole?: 'admin' | 'member' | 'judge';
    };
  };
}

export interface OrgMember {
  id: string;
  organizationId: string;
  userId: string;            // Firebase Auth UID
  role: 'owner' | 'admin' | 'member' | 'judge';
  email: string;
  displayName?: string;
  joinedAt: string;
  invitedBy?: string;
}

export interface User {
  id: string;                // Firebase Auth UID
  email: string;
  displayName?: string;
  photoUrl?: string;
  githubUsername?: string;
  websiteUrl?: string;
  bio?: string;
  role?: 'developer' | 'designer' | 'product' | 'other';
  experienceLevel?: 'beginner' | 'intermediate' | 'expert';
  profileCompleted?: boolean;
  createdAt: string;
  lastLoginAt: string;
  isOrganizer: boolean;
  organizationIds: string[];
}

export type EventPhase = 'registration' | 'building' | 'last_call' | 'review' | 'judging' | 'results';
export type VotingModel = 'peer' | 'expert';

export interface Event {
  id: string;
  name: string;
  description?: string;
  location?: string;              // City or venue name
  region?: string;                // World region (e.g., "SE Asia", "Europe", "North America")
  coordinates?: {                 // Lat/Long for map discovery
    lat: number;
    lng: number;
  };
  address?: string;               // Full physical address
  isActive: boolean;
  status: 'upcoming' | 'active' | 'archived';
  phase: EventPhase;              // Current live phase of the buildathon
  votingModel: VotingModel;       // Peer voting vs Expert judging
  startDate: string;              // ISO date
  endDate: string;                // ISO date
  submissionDeadline?: string;    // ISO date
  keyboardsDownTime?: string;     // ISO datetime - when coding must stop
  createdAt: string;
  themesGenerated: boolean;
  isLive: boolean;               // Manual "Go Live" trigger for organizers
  forceLive?: boolean;            // Prevent accidental "Go Live" clicks
  visibility: 'public' | 'unlisted' | 'private'; // Whether event appears on global maps/lists
  showVotes: boolean;             // Whether live votes are visible to participants
  scoresRevealed?: boolean;       // Whether final leaderboard scores are visible
  // Multi-tenant fields
  slug: string;                   // URL-friendly slug
  organizationId: string;         // Owner organization
  // visibility field was previously here, but I'll move it up for better organization
  createdBy?: string;             // Creator's Firebase UID
  updatedAt?: string;             // Last update timestamp
  submissionCode: string;         // Required code for project submission
  // Registration and Capacity
  maxParticipants?: number;        // Capacity cap
  currentRegistrations?: number;   // Summary count for quick UI display
  isRegistrationOpen: boolean;     // Whether users can still join
  // Live Stage & Timer
  activeTeamId?: string | null;   // ID of team currently presenting
  timerEndTime?: string | null;   // ISO timestamp for the building countdown
  isTimerPaused?: boolean;        // Whether the building timer is paused
  timerSecondsLeft?: number;      // Cache for paused time
}

export type RegistrationStatus = 'pending' | 'approved' | 'waitlisted' | 'rejected' | 'withdrawn';

export interface EventRegistration {
  id: string;
  eventId: string;
  userId: string;
  email: string;
  displayName: string;
  status: RegistrationStatus;
  registeredAt: string;
  updatedAt: string;
  organizationId: string;
  metadata?: {
    githubUsername?: string;
    role?: string;
    experience?: string;
  };
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
  organizationId?: string;        // Owner organization (denormalized)
  isPublished?: boolean;          // Whether the theme is visible to participants
  createdAt?: string;             // ISO timestamp
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
  organizationId: string;        // Owner organization (required)
  submissionCode?: string;       // Used only for creation verification
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
  eventId?: string;              // Denormalized for faster queries
  organizationId?: string;       // Denormalized for org-scoped queries
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
