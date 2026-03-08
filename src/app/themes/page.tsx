'use client';

import Link from 'next/link';
import { ArrowLeft, Palette } from 'lucide-react';
import { ThemeCard } from '@/components/themes/ThemeCard';
import { useVoting } from '@/context/VotingContext';

export default function ThemesPage() {
  const { themes, eventName } = useVoting();

  return (
    <div>
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
      >
        <ArrowLeft size={20} />
        Back to Projects
      </Link>

      <header className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <Palette size={28} className="text-accent" />
          <h1 className="text-3xl font-bold text-white">Competition Themes</h1>
        </div>
        <p className="text-zinc-400">
          Choose a theme for your {eventName} project. Each theme has specific judging criteria.
        </p>
      </header>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 items-start">
        {themes.map((theme) => (
          <ThemeCard key={theme.id} theme={theme} />
        ))}
      </div>

      {themes.length === 0 && (
        <div className="text-center py-12 text-zinc-500">
          Loading themes...
        </div>
      )}
    </div>
  );
}
