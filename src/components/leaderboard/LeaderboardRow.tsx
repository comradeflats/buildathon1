'use client';

import { useState } from 'react';
import { ChevronDown, ChevronUp, Trophy, Heart } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { StarRating } from '@/components/ui/StarRating';
import { TeamScore } from '@/lib/types';
import { useVoting } from '@/context/VotingContext';
import { formatScore } from '@/lib/scoring';

interface LeaderboardRowProps {
  teamScore: TeamScore;
  rank: number;
}

export function LeaderboardRow({ teamScore, rank }: LeaderboardRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { getThemeById, getThemeCriteria } = useVoting();

  const isWinner = rank === 1 && teamScore.voteCount > 0;
  const theme = getThemeById(teamScore.team.themeId);
  const criteria = getThemeCriteria(teamScore.team.themeId);

  return (
    <Card
      className={`overflow-hidden ${
        isWinner ? 'border-winner/50 ring-1 ring-winner/30' : ''
      }`}
    >
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full p-4 flex items-center gap-4 text-left hover:bg-card-hover transition-colors"
      >
        <div
          className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
            isWinner
              ? 'bg-winner/20 text-winner'
              : rank <= 3
              ? 'bg-accent/20 text-accent'
              : 'bg-zinc-700 text-zinc-400'
          }`}
        >
          {isWinner ? <Trophy size={20} /> : rank}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-white font-semibold truncate text-sm md:text-base">
              {teamScore.team.projectName}
            </h3>
            {isWinner && <Badge variant="winner" className="text-[10px] py-0 px-1">Winner</Badge>}
            {theme && (
              <span className="text-sm" title={theme.name}>
                {theme.emoji}
              </span>
            )}
          </div>
          <p className="text-sm text-zinc-400 truncate">{teamScore.team.name}</p>
        </div>

        {/* Favorites */}
        {teamScore.favoriteCount > 0 && (
          <div className="hidden sm:flex items-center gap-1 text-red-400" title="Favorites">
            <Heart size={16} className="fill-current" />
            <span className="text-sm font-medium">{teamScore.favoriteCount}</span>
          </div>
        )}

        <div className="text-right ml-auto">
          <div className="text-lg md:text-xl font-bold text-white leading-tight">
            {teamScore.voteCount > 0 ? formatScore(teamScore.totalAverage) : '-'}
          </div>
          <div className="text-[10px] md:text-xs text-zinc-500 uppercase tracking-wider font-medium">
            {teamScore.voteCount} {teamScore.voteCount === 1 ? 'vote' : 'votes'}
          </div>
        </div>

        {expanded ? (
          <ChevronUp size={20} className="text-zinc-400" />
        ) : (
          <ChevronDown size={20} className="text-zinc-400" />
        )}
      </button>

      {expanded && teamScore.voteCount > 0 && (
        <div className="px-4 pb-4 border-t border-zinc-800">
          {/* Theme Info */}
          {theme && (
            <div className="pt-4 pb-3 mb-3 border-b border-zinc-800">
              <div className="flex items-center gap-2">
                <span className="text-xl">{theme.emoji}</span>
                <span className="text-sm font-medium text-white">{theme.name}</span>
              </div>
              <p className="text-xs text-zinc-500 mt-1">{theme.concept}</p>
            </div>
          )}

          {/* Dynamic Criteria Scores */}
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

          {/* Favorites Count */}
          {teamScore.favoriteCount > 0 && (
            <div className="mt-4 pt-3 border-t border-zinc-800 flex items-center gap-2">
              <Heart size={16} className="text-red-400 fill-current" />
              <span className="text-sm text-zinc-400">
                {teamScore.favoriteCount} judge{teamScore.favoriteCount !== 1 ? 's' : ''} marked this as their favorite
              </span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
