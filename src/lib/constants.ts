import { Criterion } from './types';

// Legacy criteria - kept for backwards compatibility with old votes
export const LEGACY_CRITERIA: Criterion[] = [
  {
    key: 'creativeInterpretation',
    label: 'Creative Interpretation',
    description: 'How unique was the approach to the theme?',
  },
  {
    key: 'visualDesign',
    label: 'Visual Design',
    description: 'Is the interface visually appealing and polished?',
  },
  {
    key: 'usability',
    label: 'Usability',
    description: 'Is the app intuitive and easy to use?',
  },
  {
    key: 'utilityImpact',
    label: 'Utility Impact',
    description: 'Does the app solve the core problem effectively?',
  },
  {
    key: 'shipFactor',
    label: "The 'Ship' Factor",
    description: 'How complete and polished is the prototype for a 1-hour build?',
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
export const EVENT_NAME = 'Buildathon Leaderboard';
