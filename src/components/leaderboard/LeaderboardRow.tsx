'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ChevronDown, ChevronUp, Trophy, Heart, Trash2, Vote, Edit3 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { StarRating } from '@/components/ui/StarRating';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { TeamScore } from '@/lib/types';
import { useVoting } from '@/context/VotingContext';
import { useTeams } from '@/context/TeamContext';
import { useAdmin } from '@/context/AdminContext';
import { formatScore } from '@/lib/scoring';
import { getThemeIcon, getThemeIconColor } from '@/lib/themeIcons';

interface LeaderboardRowProps {
  teamScore: TeamScore;
  rank?: number;
  hideScores?: boolean;
}

export function LeaderboardRow({ teamScore, rank, hideScores = false }: LeaderboardRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { getThemeById, getThemeCriteria, showToast, hasVotedFor } = useVoting();
  const { deleteTeam } = useTeams();
  const { isAdmin } = useAdmin();

  const isWinner = !hideScores && rank === 1 && teamScore.voteCount > 0;
  const theme = getThemeById(teamScore.team.themeId);
  const criteria = getThemeCriteria(teamScore.team.themeId);
  const hasVoted = hasVotedFor(teamScore.teamId);

  const handleDelete = async (e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await deleteTeam(teamScore.teamId);
      showToast(`${teamScore.team.projectName} has been removed`, 'success');
    } catch (err) {
      showToast('Failed to remove project.', 'error');
    }
  };

  return (
    <Card
      className={`overflow-hidden ${
        isWinner ? 'border-winner/50 ring-1 ring-winner/30' : ''
      }`}
    >
      <div className="flex items-center w-full">
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex-1 p-4 flex items-center gap-4 text-left hover:bg-card-hover transition-colors min-w-0"
        >
          <div
            className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center font-bold ${
              hideScores
                ? 'bg-zinc-700 text-zinc-500'
                : isWinner
                ? 'bg-winner/20 text-winner'
                : rank && rank <= 3
                ? 'bg-accent/20 text-accent'
                : 'bg-zinc-700 text-zinc-400'
            }`}
          >
            {hideScores ? '?' : isWinner ? <Trophy size={20} /> : rank}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h3 className="text-white font-semibold truncate text-sm md:text-base">
                {teamScore.team.projectName}
              </h3>
              {isWinner && <Badge variant="winner" className="text-[10px] py-0 px-1">Winner</Badge>}
              {theme && (
                <span className="text-sm" title={theme.name}>
                  {(() => {
                    const ThemeIcon = getThemeIcon(theme);
                    return <ThemeIcon size={20} className={getThemeIconColor(theme)} />;
                  })()}
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-400 truncate">{teamScore.team.name}</p>
          </div>

          {/* Favorites */}
          {teamScore.favoriteCount > 0 && (
            <div className="flex items-center gap-1 text-red-400 shrink-0" title="Favorites">
              <Heart size={14} className="fill-current sm:w-4 sm:h-4" />
              <span className="text-xs sm:text-sm font-medium">{teamScore.favoriteCount}</span>
            </div>
          )}

          <div className="text-right ml-auto shrink-0 pr-2">
            <div className="text-lg md:text-xl font-bold text-white leading-tight">
              {hideScores ? (
                <span className="text-zinc-500">---</span>
              ) : teamScore.voteCount > 0 ? (
                formatScore(teamScore.totalAverage)
              ) : (
                '-'
              )}
            </div>
            <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider font-medium">
              {teamScore.voteCount} {teamScore.voteCount === 1 ? 'vote' : 'votes'}
            </div>
          </div>
        </button>

        <div className="flex items-center gap-2 pr-4">
          {isAdmin && (
            <div onClick={(e) => e.stopPropagation()}>
              <DeleteButton onDelete={handleDelete as any} itemName={teamScore.team.projectName} />
            </div>
          )}
          <button 
            onClick={() => setExpanded(!expanded)}
            className="p-1 hover:bg-zinc-800 rounded-full transition-colors"
          >
            {expanded ? (
              <ChevronUp size={20} className="text-zinc-400" />
            ) : (
              <ChevronDown size={20} className="text-zinc-400" />
            )}
          </button>
        </div>
      </div>

      {expanded && (
        <div className="px-4 pb-4 border-t border-zinc-800">
          {/* Theme Info */}
          {theme && (
            <div className="pt-4 pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                {(() => {
                  const ThemeIcon = getThemeIcon(theme);
                  return <ThemeIcon size={20} className={getThemeIconColor(theme)} />;
                })()}
                <span className="text-sm font-medium text-white">{theme.name}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{theme.concept}</p>
            </div>
          )}

          {/* Dynamic Criteria Scores - Hidden when scores not revealed or no votes */}
          {teamScore.voteCount > 0 && (
            hideScores ? (
              <div className="pt-4 text-center text-zinc-500">
                <p className="text-sm">Detailed scores will be revealed after voting closes</p>
              </div>
            ) : (
              <div className="pt-2 space-y-3">
                {criteria.map((criterion, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between"
                  >
                    <span className="text-sm text-zinc-400 flex-1 pr-4">
                      {index + 1}. {criterion}
                    </span>
                    <div className="flex items-center gap-3">
                      <StarRating
                        value={Math.round(teamScore.averageScores[index] || 0)}
                        readonly
                        size="sm"
                      />
                      <span className="text-sm text-white w-8 text-right">
                        {formatScore(teamScore.averageScores[index] || 0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )
          )}

          {/* Favorites Count - Hidden when scores not revealed */}
          {!hideScores && teamScore.favoriteCount > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
              <Heart size={16} className="text-red-400 fill-current" />
              <span className="text-sm text-zinc-400">
                {teamScore.favoriteCount} judge{teamScore.favoriteCount !== 1 ? 's' : ''} marked this as their favorite
              </span>
            </div>
          )}

          {/* Vote Button */}
          <div className="mt-4 pt-3 border-t border-zinc-800">
            <Link href={`/vote?teamId=${teamScore.teamId}`}>
              <Button variant={hasVoted ? 'secondary' : 'primary'} size="sm" className="w-full">
                {hasVoted ? (
                  <>
                    <Edit3 size={16} className="mr-2" />
                    View / Edit Vote
                  </>
                ) : (
                  <>
                    <Vote size={16} className="mr-2" />
                    Vote on Project
                  </>
                )}
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Card>
  );
}
