'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Send, CheckCircle, ExternalLink, Heart } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { CriteriaSlider } from './CriteriaSlider';
import { FavoriteToggle } from './FavoriteToggle';
import { useVoting } from '@/context/VotingContext';
import { ensureAbsoluteUrl } from '@/lib/github';
import { Team, Scores } from '@/lib/types';

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
    favoriteTeamId,
  } = useVoting();

  const alreadyVoted = hasVotedFor(team.id);
  const theme = getThemeById(team.themeId);
  const criteria = getThemeCriteria(team.themeId);

  // Initialize scores based on number of criteria
  const [scores, setScores] = useState<Scores>({});
  const [isFavorite, setIsFavorite] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleScoreChange = (index: number, value: number) => {
    setScores((prev) => ({ ...prev, [index]: value }));
  };

  const isValid = criteria.length > 0 &&
    criteria.every((_, index) => scores[index] > 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isValid || isSubmitting) return;

    setIsSubmitting(true);

    // Small delay for UX
    await new Promise((resolve) => setTimeout(resolve, 300));

    try {
      await submitVote(team.id, scores, isFavorite);
      showToast(`Vote submitted for ${team.projectName}!`, 'success');
      router.push('/');
    } catch (err) {
      showToast('Failed to submit vote. Please try again.', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if another project is already the favorite
  const hasOtherFavorite = favoriteTeamId && favoriteTeamId !== team.id;

  return (
    <div className="max-w-2xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </Link>

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
            <span className="text-2xl">{theme.emoji}</span>
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
          {team.githubUrl && (
            <a
              href={ensureAbsoluteUrl(team.githubUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-accent hover:underline"
            >
              View on GitHub
              <ExternalLink size={14} />
            </a>
          )}

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

        {alreadyVoted ? (
          <div className="bg-success/10 border border-success/30 rounded-lg p-6 text-center">
            <CheckCircle className="w-12 h-12 text-success mx-auto mb-3" />
            <p className="text-success font-bold text-lg">
              Rated!
            </p>
            <p className="text-sm text-zinc-400 mt-2">
              Thanks for supporting {team.projectName}.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            <h2 className="text-lg font-semibold text-white mb-4">
              Rate This Project
            </h2>

            {criteria.length === 0 ? (
              <div className="text-zinc-400 text-center py-8">
                Loading criteria...
              </div>
            ) : (
              <div className="space-y-6 mb-8">
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
                {hasOtherFavorite && !isFavorite && (
                  <p className="text-[10px] text-zinc-500 italic">
                    Note: This will replace your current favorite project.
                  </p>
                )}
              </div>
            </div>

            <Button
              type="submit"
              size="lg"
              disabled={!isValid || isSubmitting}
              className="w-full py-6 text-lg font-bold shadow-lg shadow-accent/20"
            >
              {isSubmitting ? (
                'Submitting...'
              ) : (
                <>
                  <Send size={18} className="mr-2" />
                  Submit Vote
                </>
              )}
            </Button>

            {!isValid && criteria.length > 0 && (
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
