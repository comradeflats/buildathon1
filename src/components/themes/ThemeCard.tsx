'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Theme } from '@/lib/types';

interface ThemeCardProps {
  theme: Theme;
}

export function ThemeCard({ theme }: ThemeCardProps) {
  const [showCriteria, setShowCriteria] = useState(false);

  return (
    <Card className="p-6 flex flex-col group hover:border-accent/40 transition-all duration-300">
      <div className="flex flex-col items-center text-center mb-6">
        <div className="w-16 h-16 bg-zinc-800 rounded-2xl flex items-center justify-center mb-4 text-4xl shadow-inner group-hover:scale-110 transition-transform">
          {theme.emoji}
        </div>
        <h3 className="text-xl font-bold text-white mb-2">{theme.name}</h3>
        <p className="text-sm text-zinc-400 leading-relaxed max-w-[250px]">
          {theme.concept}
        </p>
      </div>

      <div className="flex-1">
        <button 
          onClick={() => setShowCriteria(!showCriteria)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg hover:bg-zinc-800 text-xs font-medium text-zinc-500 uppercase tracking-wider transition-colors mb-2"
        >
          <span className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-accent" />
            Judging Criteria
          </span>
          {showCriteria ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>

        {showCriteria && (
          <ul className="px-3 pb-4 space-y-2 animate-in fade-in slide-in-from-top-1 duration-200">
            {theme.judgingCriteria.map((criterion, index) => (
              <li
                key={index}
                className="text-xs text-zinc-400 flex items-start gap-2"
              >
                <div className="w-1 h-1 rounded-full bg-accent mt-1.5 shrink-0" />
                <span>{criterion}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="mt-4">
        <Link href={`/submit?eventId=${theme.eventId}&themeId=${theme.id}`} className="block">
          <Button variant="secondary" size="sm" className="w-full group/btn">
            Choose Theme
            <ArrowRight size={16} className="ml-2 group-hover/btn:translate-x-1 transition-transform" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
