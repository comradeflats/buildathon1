'use client';

import { useState } from 'react';
import { Zap, Clock, Users, Trophy, Play, CheckCircle, Eye, EyeOff, Loader2, ChevronRight, Settings } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Event, EventPhase } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { useVoting } from '@/context/VotingContext';

interface EventPhaseControllerProps {
  event: Event;
}

const PHASES: { id: EventPhase; label: string; icon: any; color: string; description: string }[] = [
  { 
    id: 'registration', 
    label: 'Registration', 
    icon: Users, 
    color: 'text-blue-400', 
    description: 'Teams are setting up projects and choosing themes.' 
  },
  { 
    id: 'building', 
    label: 'Building', 
    icon: Play, 
    color: 'text-emerald-400', 
    description: 'The clock is ticking! Innovation in progress.' 
  },
  { 
    id: 'last_call', 
    label: 'Last Call', 
    icon: Clock, 
    color: 'text-amber-400', 
    description: '5 minutes remaining. Wrap up and prepare to ship.' 
  },
  { 
    id: 'review', 
    label: 'Review', 
    icon: Eye, 
    color: 'text-purple-400', 
    description: 'Keyboards down. Reviewing submissions and prep for demos.' 
  },
  { 
    id: 'judging', 
    label: 'Judging', 
    icon: Zap, 
    color: 'text-pink-400', 
    description: 'Live demos and real-time voting open to all.' 
  },
  { 
    id: 'results', 
    label: 'Results', 
    icon: Trophy, 
    color: 'text-yellow-400', 
    description: 'Reveal the winners and celebrate the buildathon.' 
  },
];

export function EventPhaseController({ event }: EventPhaseControllerProps) {
  const { getFirebaseToken } = useAuth();
  const { showToast } = useVoting();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  const updateEvent = async (updates: Partial<Event>) => {
    try {
      setIsUpdating(updates.phase || 'settings');
      const token = await getFirebaseToken();
      
      const response = await fetch(`/api/events/${event.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        throw new Error('Failed to update event');
      }

      if (updates.phase) {
        const phaseInfo = PHASES.find(p => p.id === updates.phase);
        showToast(`Phase: ${phaseInfo?.label} Started`, 'phase');
      } else {
        showToast('Event settings updated', 'success');
      }
    } catch (error) {
      console.error('Error updating event:', error);
      showToast('Failed to update event', 'error');
    } finally {
      setIsUpdating(null);
    }
  };

  const currentPhaseIndex = PHASES.findIndex(p => p.id === event.phase);
  const nextPhase = PHASES[currentPhaseIndex + 1];

  return (
    <Card className="p-6 border-emerald-500/20 bg-zinc-950/50 backdrop-blur shadow-xl overflow-hidden relative group">
      {/* Decorative accent */}
      <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 blur-[50px] -z-10 group-hover:bg-emerald-500/10 transition-colors" />
      
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Settings size={18} className="text-zinc-500" />
            <h2 className="text-sm font-bold text-zinc-400 uppercase tracking-widest">Organizer Controls</h2>
          </div>
          <p className="text-2xl font-black text-white">
            Phase: <span className={PHASES[currentPhaseIndex].color}>{PHASES[currentPhaseIndex].label}</span>
          </p>
          <p className="text-sm text-zinc-500 max-w-md">
            {PHASES[currentPhaseIndex].description}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Privacy Toggles */}
          <div className="flex items-center bg-zinc-900 rounded-lg p-1 mr-2 border border-zinc-800">
            <button
              onClick={() => updateEvent({ showVotes: !event.showVotes })}
              disabled={!!isUpdating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                event.showVotes 
                  ? 'bg-emerald-500/10 text-emerald-400' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={event.showVotes ? 'Hide live votes' : 'Show live votes'}
            >
              {event.showVotes ? <Eye size={14} /> : <EyeOff size={14} />}
              VOTES {event.showVotes ? 'ON' : 'OFF'}
            </button>
            
            <button
              onClick={() => updateEvent({ scoresRevealed: !event.scoresRevealed })}
              disabled={!!isUpdating}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-bold transition-all ${
                event.scoresRevealed 
                  ? 'bg-yellow-500/10 text-yellow-400' 
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
              title={event.scoresRevealed ? 'Hide leaderboard' : 'Reveal leaderboard'}
            >
              <Trophy size={14} />
              RESULTS {event.scoresRevealed ? 'PUBLIC' : 'HIDDEN'}
            </button>
          </div>

          {/* Next Phase Button */}
          {nextPhase && (
            <Button
              onClick={() => updateEvent({ phase: nextPhase.id })}
              disabled={!!isUpdating}
              className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-6 h-11 rounded-full shadow-lg shadow-emerald-500/20"
            >
              {isUpdating === nextPhase.id ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  START {nextPhase.label.toUpperCase()}
                  <ChevronRight size={18} className="ml-1" />
                </>
              )}
            </Button>
          )}
        </div>
      </div>

      {/* Phase Stepper Desktop */}
      <div className="hidden md:grid grid-cols-6 gap-2 mt-8 pt-6 border-t border-zinc-900">
        {PHASES.map((phase, index) => {
          const isCurrent = phase.id === event.phase;
          const isPast = index < currentPhaseIndex;
          const Icon = phase.icon;

          return (
            <button
              key={phase.id}
              onClick={() => updateEvent({ phase: phase.id })}
              disabled={!!isUpdating}
              className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all group/item ${
                isCurrent 
                  ? 'bg-zinc-900 border border-zinc-800' 
                  : 'opacity-40 hover:opacity-100 hover:bg-zinc-900/50'
              }`}
            >
              <div className={`p-2 rounded-lg ${isCurrent ? phase.color : 'text-zinc-500'} transition-colors`}>
                <Icon size={20} />
              </div>
              <span className={`text-[10px] font-bold uppercase tracking-wider ${isCurrent ? 'text-white' : 'text-zinc-600'}`}>
                {phase.label}
              </span>
              {isCurrent && (
                <div className={`w-1.5 h-1.5 rounded-full mt-1 ${phase.color.replace('text-', 'bg-')}`} />
              )}
            </button>
          );
        })}
      </div>
    </Card>
  );
}
