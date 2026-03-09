'use client';

import Link from 'next/link';
import { ChevronRight, Users, Code, Github, ExternalLink, Edit2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { DeleteButton } from '@/components/admin/DeleteButton';
import { Team } from '@/lib/types';
import { useVoting } from '@/context/VotingContext';
import { useAdmin } from '@/context/AdminContext';
import { useAuth } from '@/context/AuthContext';
import { ensureAbsoluteUrl } from '@/lib/github';

interface TeamCardProps {
  team: Team;
}

export function TeamCard({ team }: TeamCardProps) {
  const { hasVotedFor, getThemeById, deleteTeam, showToast } = useVoting();
  const { isAdmin } = useAdmin();
  const { user, isAnonymous, ownershipToken } = useAuth();
  const voted = hasVotedFor(team.id);
  const theme = getThemeById(team.themeId);

  // Check if user can edit this team
  const canEdit =
    isAdmin ||
    (user && !isAnonymous && team.ownerId === user.uid) ||
    (ownershipToken && team.ownershipToken === ownershipToken);

  const handleDelete = async () => {
    try {
      await deleteTeam(team.id);
      showToast(`${team.projectName} has been removed`, 'success');
    } catch (err) {
      showToast('Failed to remove project.', 'error');
    }
  };

  const handleExternalLink = (e: React.MouseEvent, url: string) => {
    e.preventDefault();
    e.stopPropagation();
    const absoluteUrl = ensureAbsoluteUrl(url);
    window.open(absoluteUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="group relative h-full">
      <Card hover className="p-5 h-full flex flex-col relative overflow-hidden">
        {/* Main Action - Vote Link (Stretched) */}
        <Link 
          href={`/vote?teamId=${team.id}`} 
          className="absolute inset-0 z-0" 
          aria-label={`Vote for ${team.projectName}`} 
        />

        {/* Delete Button - Top Right */}
        {isAdmin && (
          <div className="relative z-30">
            <DeleteButton onDelete={handleDelete} itemName={team.projectName} />
          </div>
        )}

        <div className="relative z-10 pointer-events-none flex flex-col h-full">
          <div className="flex items-start justify-between mb-3 gap-2">
            <div className="flex-1 min-w-0">
              <h3 className="text-base md:text-lg font-semibold text-white mb-0.5 group-hover:text-accent transition-colors truncate">
                {team.projectName}
              </h3>
              <p className="text-xs md:text-sm text-zinc-400 truncate">{team.name}</p>
            </div>
            {voted && (
              <Badge variant="success" className="shrink-0 text-[10px] py-0 px-1.5">Voted</Badge>
            )}
          </div>

          {/* Theme Badge */}
          {theme && (
            <div className="flex items-center gap-1.5 mb-3">
              <span className="text-base md:text-lg">{theme.emoji}</span>
              <span className="text-[10px] md:text-xs text-zinc-400 font-medium truncate">{theme.name}</span>
            </div>
          )}

          <p className="text-xs md:text-sm text-zinc-300 mb-4 flex-1 line-clamp-2 leading-relaxed">
            {team.description}
          </p>

          <div className="space-y-1.5 mb-6">
            {team.members.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-400">
                <Users size={12} className="shrink-0 md:w-3.5 md:h-3.5" />
                <span className="truncate">{team.members.join(', ')}</span>
              </div>
            )}
            {team.techStack.length > 0 && (
              <div className="flex items-center gap-2 text-[10px] md:text-xs text-zinc-400">
                <Code size={12} className="shrink-0 md:w-3.5 md:h-3.5" />
                <span className="truncate">{team.techStack.join(', ')}</span>
              </div>
            )}
          </div>

          {/* Links and Actions */}
          <div className="flex items-center justify-between mt-auto pt-4 border-t border-zinc-800/50 pointer-events-auto">
            <div className="flex items-center gap-2 md:gap-3">
              {team.githubUrl && (
                <button
                  onClick={(e) => handleExternalLink(e, team.githubUrl!)}
                  className="p-1.5 sm:p-2 rounded-md bg-zinc-800/50 text-zinc-400 hover:text-white hover:bg-zinc-700 transition-all relative z-20"
                  title="View GitHub"
                >
                  <Github size={16} />
                </button>
              )}
              {team.deploymentUrl && (
                <button
                  onClick={(e) => handleExternalLink(e, team.deploymentUrl!)}
                  className="p-1.5 sm:p-2 rounded-md bg-zinc-800/50 text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10 transition-all relative z-20"
                  title="Live Demo"
                >
                  <ExternalLink size={16} />
                </button>
              )}
            </div>

            <div className="flex items-center gap-1">
              {canEdit && (
                <Link
                  href={`/submit?teamId=${team.id}`}
                  className="p-1.5 sm:p-2 rounded-md text-zinc-500 hover:text-accent hover:bg-accent/10 transition-all relative z-20"
                  title="Edit submission"
                  onClick={(e) => e.stopPropagation()}
                >
                  <Edit2 size={16} />
                </Link>
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
