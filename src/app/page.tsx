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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-1">
              {eventName || 'Crowd Judge'}
            </h1>
            <p className="text-zinc-400 text-sm md:text-base">
              {totalCount > 0
                ? `${votedCount} of ${totalCount} projects rated`
                : 'Loading projects...'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2 md:gap-3">
            <Link href="/themes" className="flex-1 md:flex-none">
              <Button variant="secondary" className="w-full">
                <Palette size={18} className="mr-2" />
                Themes
              </Button>
            </Link>
            <Link href="/submit" className="flex-1 md:flex-none">
              <Button variant="secondary" className="w-full">
                <Plus size={18} className="mr-2" />
                Submit
              </Button>
            </Link>
            <Link href="/leaderboard" className="flex-1 md:flex-none">
              <Button variant="secondary" className="w-full">
                <Trophy size={18} className="mr-2" />
                Stats
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
