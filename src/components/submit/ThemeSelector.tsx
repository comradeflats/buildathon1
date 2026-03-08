'use client';

import { ChevronDown } from 'lucide-react';
import { Theme } from '@/lib/types';

interface ThemeSelectorProps {
  themes: Theme[];
  selectedThemeId: string;
  onChange: (themeId: string) => void;
}

export function ThemeSelector({ themes, selectedThemeId, onChange }: ThemeSelectorProps) {
  const selectedTheme = themes.find((t) => t.id === selectedThemeId);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-zinc-400">
        Theme <span className="text-red-400">*</span>
      </label>

      <div className="relative">
        <select
          value={selectedThemeId}
          onChange={(e) => onChange(e.target.value)}
          className="w-full appearance-none bg-zinc-800 border border-zinc-700 rounded-lg px-4 py-3 pr-10 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-transparent cursor-pointer"
        >
          <option value="">Select a theme...</option>
          {themes.map((theme) => (
            <option key={theme.id} value={theme.id}>
              {theme.emoji} {theme.name}
            </option>
          ))}
        </select>
        <ChevronDown
          size={20}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 pointer-events-none"
        />
      </div>

      {selectedTheme && (
        <div className="mt-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-2xl">{selectedTheme.emoji}</span>
            <span className="font-semibold text-white">{selectedTheme.name}</span>
          </div>
          <p className="text-sm text-zinc-400 mb-3 italic">{selectedTheme.concept}</p>

          <div className="space-y-1">
            <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider">
              Judging Criteria
            </p>
            <ul className="space-y-1">
              {selectedTheme.judgingCriteria.map((criterion, index) => (
                <li
                  key={index}
                  className="text-sm text-zinc-300 flex items-start gap-2"
                >
                  <span className="text-accent font-medium">{index + 1}.</span>
                  <span>{criterion}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      )}
    </div>
  );
}
