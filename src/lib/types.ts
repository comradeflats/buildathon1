export interface Theme {
  id: string;
  name: string;
  emoji: string;
  concept: string;
  judgingCriteria: string[];
}

export interface GitHubRepoData {
  fullName: string;
  description: string | null;
  language: string | null;
  stars: number;
  forks: number;
  topics: string[];
}

export interface Team {
  id: string;
  name: string;
  projectName: string;
  description: string;
  members: string[];
  techStack: string[];
  themeId: string;
  githubUrl?: string;
  githubData?: GitHubRepoData;
  deploymentUrl?: string;
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
  technicalComplexity: number;
  designUX: number;
  innovation: number;
  businessValue: number;
  completion: number;
}

export type CriterionKey = keyof LegacyScores;

export interface Criterion {
  key: CriterionKey;
  label: string;
  description: string;
}
