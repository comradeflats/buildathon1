import { v4 as uuidv4 } from 'uuid';
import { Vote, Team } from './types';
import { STORAGE_KEYS } from './constants';

export function getJudgeId(): string {
  if (typeof window === 'undefined') return '';

  let judgeId = localStorage.getItem(STORAGE_KEYS.JUDGE_ID);
  if (!judgeId) {
    judgeId = uuidv4();
    localStorage.setItem(STORAGE_KEYS.JUDGE_ID, judgeId);
  }
  return judgeId;
}

export function getVotes(): Vote[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.VOTES);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveVote(vote: Vote): void {
  if (typeof window === 'undefined') return;

  const votes = getVotes();
  votes.push(vote);
  localStorage.setItem(STORAGE_KEYS.VOTES, JSON.stringify(votes));

  const votedTeams = getVotedTeamIds();
  if (!votedTeams.includes(vote.teamId)) {
    votedTeams.push(vote.teamId);
    localStorage.setItem(STORAGE_KEYS.VOTED_TEAMS, JSON.stringify(votedTeams));
  }
}

export function getVotedTeamIds(): string[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.VOTED_TEAMS);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function hasVotedForTeam(teamId: string): boolean {
  return getVotedTeamIds().includes(teamId);
}

// Teams storage functions
export function getStoredTeams(): Team[] {
  if (typeof window === 'undefined') return [];

  const stored = localStorage.getItem(STORAGE_KEYS.TEAMS);
  if (!stored) return [];

  try {
    return JSON.parse(stored);
  } catch {
    return [];
  }
}

export function saveTeams(teams: Team[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEYS.TEAMS, JSON.stringify(teams));
}

export function addTeam(team: Team): void {
  const teams = getStoredTeams();
  teams.push(team);
  saveTeams(teams);
}

export function updateStoredTeam(updatedTeam: Team): void {
  const teams = getStoredTeams();
  const index = teams.findIndex((t) => t.id === updatedTeam.id);
  if (index !== -1) {
    teams[index] = updatedTeam;
    saveTeams(teams);
  } else {
    // If not found in localStorage, add it (maybe it's a base team)
    teams.push(updatedTeam);
    saveTeams(teams);
  }
}

export function removeTeam(teamId: string): void {
  const teams = getStoredTeams();
  const filtered = teams.filter((t) => t.id !== teamId);
  saveTeams(filtered);
}

// Favorite functions
export function getFavoriteTeamId(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(STORAGE_KEYS.FAVORITE_TEAM);
}

export function setFavoriteTeamId(teamId: string | null): void {
  if (typeof window === 'undefined') return;

  if (teamId) {
    localStorage.setItem(STORAGE_KEYS.FAVORITE_TEAM, teamId);
  } else {
    localStorage.removeItem(STORAGE_KEYS.FAVORITE_TEAM);
  }
}
