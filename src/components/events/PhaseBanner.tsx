'use client';

import { EventPhase } from '@/lib/types';
import { 
  Users, Play, Clock, MousePointer2, Zap, Trophy,
  ChevronRight, Info
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

interface PhaseBannerProps {
  phase: EventPhase;
  isApproved?: boolean;
}

const PHASE_CONFIG: Record<EventPhase, { 
  label: string; 
  icon: any; 
  color: string; 
  bg: string;
  border: string;
  description: string;
  nextStep: string;
}> = {
  registration: {
    label: 'Registration Open',
    icon: Users,
    color: 'text-blue-400',
    bg: 'bg-blue-500/5',
    border: 'border-blue-500/20',
    description: 'Teams are forming and securing their spots in the arena.',
    nextStep: 'Check the "Theme Leaks" below to prepare.'
  },
  building: {
    label: 'Building Phase',
    icon: Play,
    color: 'text-emerald-400',
    bg: 'bg-emerald-500/5',
    border: 'border-emerald-500/20',
    description: 'The arena is live! Full themes are revealed and submissions are open.',
    nextStep: 'Hurry! Check the timer and ship your project.'
  },
  review: {
    label: 'Live Demos',
    icon: MousePointer2,
    color: 'text-purple-400',
    bg: 'bg-purple-500/5',
    border: 'border-purple-500/20',
    description: 'Submissions are locked. We are going through live demos now.',
    nextStep: 'Vote for your favorite projects as they appear on stage.'
  },
  judging: {
    label: 'Judging in Progress',
    icon: Zap,
    color: 'text-pink-400',
    bg: 'bg-pink-500/5',
    border: 'border-pink-500/20',
    description: 'Organizers are finalizing votes and calculating final scores.',
    nextStep: 'Watch the leaderboard as the rankings stabilize.'
  },
  results: {
    label: 'Winners Announced',
    icon: Trophy,
    color: 'text-yellow-400',
    bg: 'bg-yellow-500/5',
    border: 'border-yellow-500/20',
    description: 'The event has concluded. Congratulations to all builders!',
    nextStep: 'Explore the leaderboard to see the final standings.'
  }
};

export function PhaseBanner({ phase, isApproved }: PhaseBannerProps) {
  const config = PHASE_CONFIG[phase] || PHASE_CONFIG.registration;
  const Icon = config.icon;

  return (
    <div className={`p-6 rounded-[2rem] border ${config.bg} ${config.border} backdrop-blur-sm animate-in fade-in slide-in-from-top-4 duration-700`}>
      <div className="flex flex-col md:flex-row items-center gap-6">
        <div className={`w-16 h-16 shrink-0 rounded-2xl bg-black/40 flex items-center justify-center ${config.color} border ${config.border.replace('/20', '/40')}`}>
          <Icon size={32} />
        </div>
        
        <div className="flex-1 text-center md:text-left space-y-1">
          <div className="flex items-center justify-center md:justify-start gap-3">
            <h3 className={`text-xl font-black italic tracking-tight ${config.color}`}>
              {config.label.toUpperCase()}
            </h3>
            {phase === 'building' && (
              <Badge className="bg-emerald-500 text-zinc-950 font-black animate-pulse">LIVE</Badge>
            )}
          </div>
          <p className="text-zinc-400 text-sm font-medium leading-relaxed">
            {config.description}
          </p>
        </div>

        <div className="w-full md:w-auto px-6 py-3 rounded-xl bg-black/20 border border-zinc-800/50 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-900 flex items-center justify-center text-zinc-500">
            <Info size={16} />
          </div>
          <div className="flex-1">
            <p className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Next Step</p>
            <p className="text-xs font-bold text-zinc-300">{config.nextStep}</p>
          </div>
          <ChevronRight size={16} className="text-zinc-700 hidden sm:block" />
        </div>
      </div>
    </div>
  );
}
