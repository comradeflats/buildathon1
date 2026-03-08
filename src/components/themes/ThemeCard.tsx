'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Theme } from '@/lib/types';

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  return (
    <Card className="p-6 h-full flex flex-col">
      <div className="flex items-center gap-3 mb-3">
        <span className="text-3xl">{theme.emoji}</span>
        <h3 className="text-lg font-semibold text-white">{theme.name}</h3>
      </div>

      <p className="text-sm text-zinc-400 italic mb-4">{theme.concept}</p>

      <div className="flex-1 mb-4">
        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-2">
          Judging Criteria
        </p>
        <ul className="space-y-1.5">
          {theme.judgingCriteria.map((criterion, index) => (
            <li
              key={index}
              className="text-sm text-zinc-300 flex items-start gap-2"
            >
              <span className="text-accent font-medium shrink-0">{index + 1}.</span>
              <span>{criterion}</span>
            </li>
          ))}
        </ul>
      </div>

      <Link href={`/submit?eventId=${theme.eventId}&themeId=${theme.id}`}>
        <Button variant="secondary" size="sm" className="w-full">
          Submit with this theme
          <ArrowRight size={16} className="ml-2" />
        </Button>
      </Link>
    </Card>
  );
}
