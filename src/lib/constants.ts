import { Criterion } from './types';

// Legacy criteria - kept for backwards compatibility with old votes
export const LEGACY_CRITERIA: Criterion[] = [
  {
    key: 'technicalComplexity',
    label: 'Technical Complexity',
    description: 'How technically challenging is the implementation?',
  },
  {
    key: 'designUX',
    label: 'Design & UX',
    description: 'How polished and user-friendly is the interface?',
  },
  {
    key: 'innovation',
    label: 'Innovation',
    description: 'How creative and original is the solution?',
  },
  {
    key: 'businessValue',
    label: 'Business Value',
    description: 'How viable is this as a real product?',
  },
  {
    key: 'completion',
    label: 'Completion',
    description: 'How complete and functional is the demo?',
  },
];

// Alias for backwards compatibility
export const CRITERIA = LEGACY_CRITERIA;

export const STORAGE_KEYS = {
  JUDGE_ID: 'judge_id',
  VOTES: 'judge_votes',
  VOTED_TEAMS: 'voted_team_ids',
  TEAMS: 'judge_teams',
  FAVORITE_TEAM: 'favorite_team_id',
} as const;

// Default theme for teams without a theme assigned
export const DEFAULT_THEME_ID = 'micro-helper';

// Event name constant
export const EVENT_NAME = 'March Buildathon 2026';
