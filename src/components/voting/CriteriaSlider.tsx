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
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-white font-medium">{criterion.label}</label>
        <span className="text-sm text-zinc-400">{value}/5</span>
      </div>
      <p className="text-sm text-zinc-500">{criterion.description}</p>
      <div className="pt-1">
        <StarRating value={value} onChange={onChange} size="lg" />
      </div>
    </div>
  );
}
