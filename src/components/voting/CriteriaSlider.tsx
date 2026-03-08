'use client';

import { StarRating } from '@/components/ui/StarRating';
import { Criterion } from '@/lib/types';

interface CriteriaSliderProps {
  criterion: Criterion;
  value: number;
  onChange: (value: number) => void;
}

export function CriteriaSlider({ criterion, value, onChange }: CriteriaSliderProps) {
  return (
    <div className="space-y-2 p-4 bg-zinc-800/30 rounded-lg border border-zinc-700/50">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <label className="text-white font-semibold text-sm md:text-base leading-tight">
            {criterion.description}
          </label>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className={`text-lg font-bold ${value > 0 ? 'text-winner' : 'text-zinc-600'}`}>
            {value > 0 ? value : '-'}
          </span>
          <span className="text-[10px] text-zinc-500 uppercase tracking-tighter">/ 5</span>
        </div>
      </div>
      <div className="pt-2 flex justify-center md:justify-start">
        <StarRating value={value} onChange={onChange} size="lg" />
      </div>
    </div>
  );
}
