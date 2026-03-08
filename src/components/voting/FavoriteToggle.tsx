'use client';

import { Heart } from 'lucide-react';

interface FavoriteToggleProps {
  isActive: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}

export function FavoriteToggle({ isActive, onChange, disabled = false }: FavoriteToggleProps) {
  return (
    <button
      type="button"
      onClick={() => onChange(!isActive)}
      disabled={disabled}
      className={`
        flex items-center gap-2 px-4 py-3 rounded-lg border transition-all
        ${
          isActive
            ? 'bg-red-500/20 border-red-500/50 text-red-400'
            : 'bg-zinc-800/50 border-zinc-700 text-zinc-400 hover:border-zinc-600 hover:text-zinc-300'
        }
        ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
      `}
    >
      <Heart
        size={20}
        className={isActive ? 'fill-current' : ''}
      />
      <span className="font-medium">
        {isActive ? 'My Favorite!' : 'Mark as Favorite'}
      </span>
    </button>
  );
}
