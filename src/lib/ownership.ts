import { Team } from './types';
import { User } from 'firebase/auth';

/**
 * Check if a user is the owner of a team
 * Matches either by Firebase UID (ownerId) or by IndexedDB token (ownershipToken)
 */
export function isTeamOwner(
  team: Team,
  user: User | null,
  ownershipToken: string | null
): boolean {
  // Check GitHub UID match for signed-in users
  if (user && !user.isAnonymous && team.ownerId) {
    if (team.ownerId === user.uid) {
      return true;
    }
  }

  // Check ownership token match for anonymous users
  if (ownershipToken && team.ownershipToken) {
    if (team.ownershipToken === ownershipToken) {
      return true;
    }
  }

  return false;
}

/**
 * Check if user has submitted a project to a specific event
 */
export function hasSubmittedToEvent(
  teams: Team[],
  eventId: string,
  user: User | null,
  ownershipToken: string | null
): boolean {
  return teams.some(
    (team) => team.eventId === eventId && isTeamOwner(team, user, ownershipToken)
  );
}

/**
 * Get the user's submission for a specific event (if any)
 */
export function getUserSubmissionForEvent(
  teams: Team[],
  eventId: string,
  user: User | null,
  ownershipToken: string | null
): Team | undefined {
  return teams.find(
    (team) => team.eventId === eventId && isTeamOwner(team, user, ownershipToken)
  );
}

/**
 * Get all teams owned by the user
 */
export function getUserTeams(
  teams: Team[],
  user: User | null,
  ownershipToken: string | null
): Team[] {
  return teams.filter((team) => isTeamOwner(team, user, ownershipToken));
}
