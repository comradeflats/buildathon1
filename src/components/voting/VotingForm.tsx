'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, ExternalLink, Heart, Clock, Loader2, Edit3, Globe, Link as LinkIcon } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CriteriaSlider } from './CriteriaSlider';
import { FavoriteToggle } from './FavoriteToggle';
import { useVoting } from '@/context/VotingContext';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/context/AuthContext';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { ensureAbsoluteUrl } from '@/lib/github';
import { Team, Scores } from '@/lib/types';
import { getUrlLinkText } from '@/lib/urls';
import { getThemeIcon, getThemeIconColor } from '@/lib/themeIcons';

interface VotingFormProps {
  team: Team;
}

export function VotingForm({ team }: VotingFormProps) {
  const router = useRouter();
  const {
    hasVotedFor,
    submitVote,
    showToast,
    getThemeById,
    getThemeCriteria,
    isFavorite: checkIsFavorite,
    getVoteForTeam,
    updateVote,
  } = useVoting();
  const { getEventById } = useEvents();
  const { isAuthenticated, user } = useAuth();

  const existingVote = getVoteForTeam(team.id);
  const alreadyVoted = !!existingVote;
  const theme = getThemeById(team.themeId);
  const criteria = getThemeCriteria(team.themeId);
  const event = getEventById(team.eventId);

  const { isAdmin } = useOrgPermissions(event?.organizationId || null);

  // Initialize scores based on number of criteria
  const [scores, setScores] = useState<Scores>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [attemptedSubmit, setAttemptedSubmit] = useState(false);

  // Initialize scores when criteria are loaded
  useEffect(() => {
    if (criteria.length > 0 && Object.keys(scores).length === 0) {
      const initialScores: Scores = {};
      criteria.forEach((_, index) => {
        initialScores[index] = 0;
      });
      setScores(initialScores);
    }
  }, [criteria, scores]);

  // Initialize scores from existing vote when editing
  useEffect(() => {
    if (isEditing && existingVote) {
      setScores(existingVote.scores);
      setIsFavorite(existingVote.isFavorite);
    }
  }, [isEditing, existingVote]);

  const handleScoreChange = (index: number, value: number) => {
    setScores((prev) => ({ ...prev, [index]: value }));
  };

  const handleResetScores = () => {
    const resetScores: Scores = {};
    criteria.forEach((_, index) => {
      resetScores[index] = 0;
    });
    setScores(resetScores);
    setAttemptedSubmit(false);
    showToast('Ratings cleared', 'info');
  };

  const isValid = criteria.length > 0 &&
    criteria.every((_, index) => scores[index] > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAttemptedSubmit(true);
    if (!isValid || isSubmitting) return;

    if (!isAuthenticated) {
      showToast('Please sign in to submit your vote', 'error');
      return;
    }

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      if (isEditing && existingVote) {
        await updateVote(existingVote.id, scores, isFavorite);
        showToast(`Vote updated for ${team.projectName}!`, 'success');
        setIsEditing(false);
      } else {
        await submitVote(team.id, scores, isFavorite);
        showToast(`Vote submitted for ${team.projectName}!`, 'success');
        router.push(`/leaderboard?event=${team.eventId}`);
      }
    } catch (err) {
      showToast('Failed to submit vote. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  const canVote = event?.phase === 'judging' || isAdmin;

  return (
    <div className="max-w-2xl lg:max-w-4xl mx-auto">
      <Link
        href={event?.slug ? `/e/${event.slug}/gallery` : (event?.id ? `/events/${event.id}` : "/events")}
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </Link>

      {event && event.phase !== 'judging' && !isAdmin && (
        <div className="mb-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-center gap-3 text-amber-400">
          <Clock size={20} className="shrink-0" />
          <p className="text-sm font-medium">
            Voting is currently {event.phase === 'results' ? 'closed' : 'locked'}. 
            {event.phase !== 'results' && ' It will open during the live demos!'}
          </p>
        </div>
      )}

      <Card className="p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-white mb-1">
              {team.projectName}
            </h1>
            <p className="text-zinc-400">{team.name}</p>
          </div>
          {alreadyVoted && (
            <Badge variant="success">
              <CheckCircle size={12} className="mr-1" />
              Already Voted
            </Badge>
          )}
        </div>

        <p className="text-zinc-300 mb-4">{team.description}</p>

        {/* Theme Badge */}
        {theme && (
          <div className="flex items-center gap-2 mb-4 p-3 bg-zinc-800/50 rounded-lg border border-zinc-700">
            {(() => {
              const ThemeIcon = getThemeIcon(theme);
              return <ThemeIcon size={24} className={getThemeIconColor(theme)} />;
            })()}
            <div>
              <p className="text-sm font-medium text-white">{theme.name}</p>
              <p className="text-xs text-zinc-400">{theme.concept}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap gap-2 mb-6">
          {team.techStack.map((tech) => (
            <Badge key={tech}>{tech}</Badge>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 mb-6">
          {/* Primary URL for non-GitHub types */}
          {team.primaryUrl && team.urlType && team.urlType !== 'github' && (
            <a
              href={ensureAbsoluteUrl(team.primaryUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className={`inline-flex items-center gap-2 text-sm hover:underline ${
                team.urlType === 'website' ? 'text-emerald-400' : 'text-accent'
              }`}
            >
              {team.urlType === 'website' ? <Globe size={14} /> : <LinkIcon size={14} />}
              {getUrlLinkText(team.urlType)}
              <ExternalLink size={14} />
            </a>
          )}

          {/* GitHub URL (either primary or legacy) */}
          {(team.githubUrl || (team.urlType === 'github' && team.primaryUrl)) && (
            <a
              href={ensureAbsoluteUrl(team.githubUrl || team.primaryUrl!)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              View on GitHub
              <ExternalLink size={14} />
            </a>
          )}

          {/* Deployment URL (for GitHub submissions) */}
          {team.deploymentUrl && (
            <a
              href={ensureAbsoluteUrl(team.deploymentUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-emerald-400 hover:underline"
            >
              Live Demo
              <ExternalLink size={14} />
            </a>
          )}
        </div>

        <div className="flex items-center gap-2 text-sm text-zinc-400 mb-8">
          <span>Team:</span>
          <span className="text-white">
            {team.members.length > 0 ? team.members.join(', ') : 'Not specified'}
          </span>
        </div>

        {alreadyVoted && !isEditing ? (
          <div className="bg-success/10 border border-success/30 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-success font-bold text-lg">
              Rated!
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              Thanks for supporting {team.projectName}.
            </p>
            <Button
              variant="secondary"
              className="mt-4"
              onClick={() => setIsEditing(true)}
            >
              <Edit3 size={16} className="mr-2" />
              Edit Vote
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white">
                Rate This Project
              </h2>
              {criteria.length > 0 && (
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={handleResetScores}
                  className="text-xs"
                >
                  Reset All Ratings
                </Button>
              )}
            </div>

            {criteria.length === 0 ? (
              <div className="text-zinc-400 text-center py-8">
                Loading criteria...
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-6 mb-8">
                {criteria.map((criterion, index) => (
                  <CriteriaSlider
                    key={index}
                    criterion={{
                      key: `criterion_${index}` as any,
                      label: `Criterion ${index + 1}`,
                      description: criterion,
                    }}
                    value={scores[index] || 0}
                    onChange={(value) => handleScoreChange(index, value)}
                    showValidation={attemptedSubmit}
                  />
                ))}
              </div>
            )}

            {/* Favorite Toggle */}
            <div className="p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50 my-6">
              <h3 className="text-sm font-semibold text-zinc-400 mb-4 flex items-center gap-2">
                <Heart size={16} className={isFavorite ? 'fill-red-400 text-red-400' : ''} />
                Personal Favorite
              </h3>
              <div className="flex flex-col gap-3">
                <FavoriteToggle
                  isActive={isFavorite}
                  onChange={setIsFavorite}
                />
              </div>
            </div>

            {canVote && (
              <Button
                type="submit"
                size="lg"
                disabled={!isValid || isSubmitting}
                className={`w-full py-6 text-lg font-bold shadow-lg shadow-accent/20 ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? (
                  <div className="flex items-center justify-center gap-3">
                    <Loader2 size={18} className="animate-spin" />
                    <span>Saving your vote...</span>
                  </div>
                ) : isEditing ? (
                  <>
                    <Send size={18} className="mr-2" />
                    Update Vote
                  </>
                ) : (
                  <>
                    <Send size={18} className="mr-2" />
                    Submit Vote
                  </>
                )}
              </Button>
            )}

            {!isValid && criteria.length > 0 && canVote && (
              <p className="text-sm text-zinc-500 text-center mt-3">
                Please rate all criteria before submitting
              </p>
            )}
          </form>
        )}
      </Card>
    </div>
  );
}
