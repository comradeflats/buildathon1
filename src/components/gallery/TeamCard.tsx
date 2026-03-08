'use client';

import Link from 'next/link';
import { ChevronRight, Users, Code, Github, ExternalLink, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Team } from '@/lib/types';
import { useVoting } from '@/context/VotingContext';
import { ensureAbsoluteUrl } from '@/lib/github';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const { hasVotedFor, getThemeById, deleteTeam, showToast } = useVoting();
  const voted = hasVotedFor(team.id);
  const theme = getThemeById(team.themeId);

  const handleDelete = () => {
    deleteTeam(team.id);
    showToast(`${team.projectName} has been removed`, 'success');
  };

  const handleExternalLink = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    const absoluteUrl = ensureAbsoluteUrl(url);
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative h-full">
      <Link href={`/vote?teamId=${team.id}`} className="block h-full">
        <Card hover className="p-5 h-full flex flex-col">
          <div className="flex items-start justify-between mb-3">
            <div className="flex-1 min-w-0">
              <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-accent transition-colors truncate">
                {team.projectName}
              </h3>
              <p className="text-sm text-zinc-400 truncate">{team.name}</p>
            </div>
            {voted && (
              <Badge variant="success" className="shrink-0 ml-2">Voted</Badge>
            )}
          </div>

          {/* Theme Badge */}
          {theme && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-lg">{theme.emoji}</span>
              <span className="text-xs text-zinc-400 font-medium">{theme.name}</span>
            </div>
          )}

          <p className="text-sm text-zinc-300 mb-4 flex-1 line-clamp-2">
            {team.description}
          </p>

          <div className="space-y-2 mb-6">
            {team.members.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Users size={14} className="shrink-0" />
                <span className="truncate">{team.members.join(', ')}</span>
              </div>
            )}
            {team.techStack.length > 0 && (
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Code size={14} className="shrink-0" />
                <span className="truncate">{team.techStack.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Links and Actions */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50">
            <div className="flex items-center gap-3">
              {team.githubUrl && (
                <button
                  onClick={(e) => handleExternalLink(e, team.githubUrl!)}
                  className="p-1.5 rounded-md bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all"
                  title="View GitHub"
                >
                  <Github size={16} />
                </button>
              )}
              {team.deploymentUrl && (
                <button
                  onClick={(e) => handleExternalLink(e, team.deploymentUrl!)}
                  className="p-1.5 rounded-md bg-zinc-800/50 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all"
                  title="Live Demo"
                >
                  <ExternalLink size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              <Link
                href={`/submit?teamId=${team.id}`}
                className="p-1.5 rounded-md text-zinc-500 hover:text-accent hover:bg-accent/10 transition-all"
                title="Edit submission"
                onClick={(e) => e.stopPropagation()}
              >
                <Edit2 size={16} />
              </Link>
              <DeleteButton onDelete={handleDelete} itemName={team.projectName} />
            </div>
          </div>
        </Card>
      </Link>
    </div>
  );
}
