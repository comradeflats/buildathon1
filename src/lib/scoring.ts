import { Vote, Team, TeamScore, Scores, Theme } from './types';
import { DEFAULT_THEME_ID } from './constants';

export function calculateTeamScores(
  votes: Vote[],
  teams: Team[],
  themes: Theme[]
): TeamScore[] {
  const teamVotesMap = new Map<string, Vote[]>();

  // Group votes by team
  for (const vote of votes) {
    const existing = teamVotesMap.get(vote.teamId) || [];
    existing.push(vote);
    teamVotesMap.set(vote.teamId, existing);
  }

  // Calculate scores for each team
  const teamScores: TeamScore[] = teams.map((team) => {
    const teamVotes = teamVotesMap.get(team.id) || [];
    const theme = themes.find((t) => t.id === team.themeId) ||
                  themes.find((t) => t.id === DEFAULT_THEME_ID);
    const criteriaCount = theme?.judgingCriteria.length || 5;

    // Count favorites for this team
    const favoriteCount = teamVotes.filter((v) => v.isFavorite).length;

    if (teamVotes.length === 0) {
      // Create empty scores object
      const emptyScores: Scores = {};
      for (let i = 0; i < criteriaCount; i++) {
        emptyScores[i] = 0;
      }

      return {
        teamId: team.id,
        team,
        averageScores: emptyScores,
        totalAverage: 0,
        voteCount: 0,
        favoriteCount: 0,
      };
    }

    // Calculate average for each criterion
    const averageScores: Scores = {};
    for (let i = 0; i < criteriaCount; i++) {
      const sum = teamVotes.reduce((acc, vote) => {
        // Handle both new dynamic scores and legacy scores
        const score = vote.scores[i] ?? 0;
        return acc + score;
      }, 0);
      averageScores[i] = sum / teamVotes.length;
    }

    // Calculate total average (average of all criterion averages)
    const criterionAverages = Object.values(averageScores);
    const totalAverage =
      criterionAverages.length > 0
        ? criterionAverages.reduce((a, b) => a + b, 0) / criterionAverages.length
        : 0;

    return {
      teamId: team.id,
      team,
      averageScores,
      totalAverage,
      voteCount: teamVotes.length,
      favoriteCount,
    };
  });

  // Sort by total average DESC, then by first criterion DESC (tiebreaker), then by favorites DESC
  teamScores.sort((a, b) => {
    if (b.totalAverage !== a.totalAverage) {
      return b.totalAverage - a.totalAverage;
    }
    // First criterion tiebreaker
    const aFirst = a.averageScores[0] ?? 0;
    const bFirst = b.averageScores[0] ?? 0;
    if (bFirst !== aFirst) {
      return bFirst - aFirst;
    }
    // Favorites as final tiebreaker
    return b.favoriteCount - a.favoriteCount;
  });

  return teamScores;
}

export function formatScore(score: number): string {
  return score.toFixed(1);
}
