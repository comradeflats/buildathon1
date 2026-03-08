'use client';

import Link from 'next/link';
import { Trophy, Plus, Palette, Inbox } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { TeamGallery } from '@/components/gallery/TeamGallery';
import { useVoting } from '@/context/VotingContext';

export default function HomePage() {
  const { eventName, votedTeamIds, teams } = useVoting();

  const votedCount = votedTeamIds.length;
  const totalCount = teams.length;

  return (
    <div>
      <header className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold text-white mb-1">
              {eventName || 'Crowd Judge'}
            </h1>
            <p className="text-zinc-400">
              {totalCount > 0
                ? `${votedCount} of ${totalCount} projects rated`
                : 'Loading projects...'}
            </p>
          </div>
          <div className="flex gap-3">
            <Link href="/themes">
              <Button variant="secondary">
                <Palette size={18} className="mr-2" />
                Browse Themes
              </Button>
            </Link>
            <Link href="/submit">
              <Button variant="secondary">
                <Plus size={18} className="mr-2" />
                Submit Project
              </Button>
            </Link>
            <Link href="/leaderboard">
              <Button variant="secondary">
                <Trophy size={18} className="mr-2" />
                Leaderboard
              </Button>
            </Link>
          </div>
        </div>

        {totalCount > 0 && (
          <div className="w-full bg-zinc-800 rounded-full h-2">
            <div
              className="bg-accent h-2 rounded-full transition-all duration-500"
              style={{ width: `${(votedCount / totalCount) * 100}%` }}
            />
          </div>
        )}
      </header>

      <TeamGallery />
    </div>
  );
}
