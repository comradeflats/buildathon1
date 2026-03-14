'use client';

import { StarRating } from '@/components/ui/StarRating';
import { Criterion } from '@/lib/types';

interface CriteriaSliderProps {
  criterion: Criterion;
  value: number;
  onChange: (value: number) => void;
  showValidation?: boolean;
}

export function CriteriaSlider({ criterion, value, onChange, showValidation = false }: CriteriaSliderProps) {
  const isEmpty = value === 0;
  const shouldHighlight = isEmpty && showValidation;

  return (
    <div className={`space-y-2 p-4 bg-zinc-800/30 rounded-lg border ${
      shouldHighlight ? 'border-rose-500/50 pulse-empty' :
      isEmpty ? 'border-zinc-700/50' :
      'border-emerald-500/30'
    }`}>
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
      {isEmpty && showValidation && (
        <p className="text-rose-400 text-xs mt-1">Please rate this criterion</p>
      )}
    </div>
  );
}
