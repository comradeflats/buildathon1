'use client';

import { useState } from 'react';
import { 
  Zap, Clock, Users, Trophy, Play, CheckCircle, 
  Eye, EyeOff, Loader2, ChevronRight, Settings, 
  Pause, MousePointer2, ChevronLeft, LayoutPanelLeft 
} from 'lucide-react';
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
    description: 'Participants are joining. Themes are hidden or in preview.' 
  },
  { 
    id: 'building', 
    label: 'Building', 
    icon: Play, 
    color: 'text-emerald-400', 
    description: 'Active buildathon! Full themes revealed and submissions open.' 
  },
  { 
    id: 'last_call', 
    label: 'Last Call', 
    icon: Clock, 
    color: 'text-amber-400', 
    description: 'Coding time almost up. Final push before keyboards down!' 
  },
  { 
    id: 'review', 
    label: 'Live Demos', 
    icon: MousePointer2, 
    color: 'text-purple-400', 
    description: 'Submissions locked. One-by-one demos and live voting.' 
  },
  { 
    id: 'judging', 
    label: 'Judging', 
    icon: Zap, 
    color: 'text-pink-400', 
    description: 'Finalizing votes and calculating scores.' 
  },
  { 
    id: 'results', 
    label: 'Results', 
    icon: Trophy, 
    color: 'text-yellow-400', 
    description: 'Event concluded. Winners announced!' 
  },
];

function LiveTimer({ event, onUpdate }: { event: Event, onUpdate: (updates: Partial<Event>) => Promise<void> }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (!event.timerEndTime || event.isTimerPaused) {
      if (event.timerSecondsLeft) setTimeLeft(event.timerSecondsLeft);
      return;
    }

    const interval = setInterval(() => {
      const end = new Date(event.timerEndTime!).getTime();
      const now = new Date().getTime();
      const diff = Math.max(0, Math.floor((end - now) / 1000));
      setTimeLeft(diff);
      
      if (diff === 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [event.timerEndTime, event.isTimerPaused, event.timerSecondsLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const adjustTimer = async (minutes: number) => {
    setIsUpdating(true);
    const currentEnd = event.timerEndTime ? new Date(event.timerEndTime).getTime() : new Date().getTime();
    const newEnd = new Date(currentEnd + minutes * 60 * 1000).toISOString();
    await onUpdate({ timerEndTime: newEnd });
    setIsUpdating(false);
  };

  const togglePause = async () => {
    setIsUpdating(true);
    if (event.isTimerPaused) {
      const newEnd = new Date(new Date().getTime() + (event.timerSecondsLeft || 0) * 1000).toISOString();
      await onUpdate({ isTimerPaused: false, timerEndTime: newEnd });
    } else {
      await onUpdate({ isTimerPaused: true, timerSecondsLeft: timeLeft });
    }
    setIsUpdating(false);
  };

  return (
    <div className="flex flex-col gap-4 p-4 bg-zinc-900 rounded-2xl border border-zinc-800 shadow-inner">
      <div className="flex items-center justify-between">
        <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">Arena Timer</span>
        {event.isTimerPaused && <Badge variant="secondary" className="animate-pulse bg-amber-500/10 text-amber-500 border-amber-500/20">PAUSED</Badge>}
      </div>
      
      <div className="flex items-center justify-between gap-4">
        <div className={`text-3xl font-black tabular-nums tracking-tighter ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-white'}`}>
          {formatTime(timeLeft)}
        </div>
        
        <div className="flex items-center gap-1">
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 w-7 p-0 hover:bg-zinc-800" 
            onClick={togglePause}
            disabled={isUpdating}
          >
            {event.isTimerPaused ? <Play size={14} /> : <Pause size={14} />}
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-1.5 text-[9px] font-bold hover:bg-zinc-800" 
            onClick={() => adjustTimer(5)}
            disabled={isUpdating}
          >
            +5M
          </Button>
          <Button 
            size="sm" 
            variant="ghost" 
            className="h-7 px-1.5 text-[9px] font-bold hover:bg-zinc-800" 
            onClick={() => adjustTimer(-5)}
            disabled={isUpdating}
          >
            -5M
          </Button>
        </div>
      </div>
    </div>
  );
}

import { useEffect } from 'react';

export function EventPhaseController({ event }: EventPhaseControllerProps) {
  const { getFirebaseToken } = useAuth();
  const { showToast } = useVoting();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);
  const [isOpen, setIsOpen] = useState(false);

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
    <>
      {/* Drawer Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`fixed right-0 top-1/2 -translate-y-1/2 z-50 p-2 bg-zinc-950 border-y border-l border-emerald-500/50 rounded-l-2xl shadow-2xl transition-all duration-300 ${isOpen ? 'translate-x-full opacity-0' : 'translate-x-0 opacity-100'}`}
      >
        <div className="flex flex-col items-center gap-2">
          <Settings size={20} className="text-emerald-500 animate-spin-slow" />
          <span className="text-[10px] font-black uppercase tracking-widest [writing-mode:vertical-lr] rotate-180">Organizer Controls</span>
          <ChevronLeft size={16} className="text-zinc-500 mt-2" />
        </div>
      </button>

      {/* Organizer Drawer */}
      <div className={`fixed inset-y-0 right-0 w-80 z-50 transition-all duration-500 ease-out transform ${isOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <Card className="h-full border-l border-zinc-800 bg-zinc-950/80 backdrop-blur-2xl shadow-2xl flex flex-col rounded-none">
          {/* Drawer Header */}
          <div className="p-6 border-b border-zinc-900 flex items-center justify-between bg-zinc-900/30">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Settings size={20} className="text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Management</h2>
                <p className="text-sm font-bold text-white">Stage Manager</p>
              </div>
            </div>
            <button 
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-white/5 rounded-lg transition-colors"
            >
              <ChevronRight size={20} className="text-zinc-500" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-8">
            {/* Current Phase Status */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Live Phase</label>
              <div className="p-4 bg-zinc-900 rounded-2xl border border-zinc-800 flex items-center gap-4">
                <div className={`p-3 rounded-xl bg-black/40 ${PHASES[currentPhaseIndex]?.color || 'text-white'}`}>
                  {(() => {
                    const Icon = PHASES[currentPhaseIndex]?.icon || Play;
                    return <Icon size={24} />;
                  })()}
                </div>
                <div>
                  <p className={`text-xl font-black ${PHASES[currentPhaseIndex]?.color || 'text-white'}`}>
                    {PHASES[currentPhaseIndex]?.label || 'Unknown'}
                  </p>
                  <p className="text-[10px] text-zinc-500 leading-tight mt-0.5">
                    {PHASES[currentPhaseIndex]?.description}
                  </p>
                </div>
              </div>
            </div>

            {/* Next Phase Quick Action */}
            {nextPhase && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Next Sequence</label>
                <Button
                  onClick={() => updateEvent({ phase: nextPhase.id })}
                  disabled={!!isUpdating}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black h-14 rounded-2xl shadow-lg shadow-emerald-500/10 flex items-center justify-between px-6"
                >
                  <div className="text-left">
                    <span className="text-[10px] opacity-60 block">START</span>
                    <span className="text-sm">{nextPhase.label.toUpperCase()}</span>
                  </div>
                  {isUpdating === nextPhase.id ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <ChevronRight size={20} />
                  )}
                </Button>
              </div>
            )}

            {/* Privacy Toggles */}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Live Visibility</label>
              <div className="grid grid-cols-1 gap-2">
                <button
                  onClick={() => updateEvent({ showVotes: !event.showVotes })}
                  disabled={!!isUpdating}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    event.showVotes 
                      ? 'bg-emerald-500/5 border-emerald-500/20 text-emerald-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    {event.showVotes ? <Eye size={16} /> : <EyeOff size={16} />}
                    VOTES {event.showVotes ? 'ENABLED' : 'HIDDEN'}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${event.showVotes ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]' : 'bg-zinc-700'}`} />
                </button>
                
                <button
                  onClick={() => updateEvent({ scoresRevealed: !event.scoresRevealed })}
                  disabled={!!isUpdating}
                  className={`flex items-center justify-between px-4 py-3 rounded-xl text-xs font-bold transition-all border ${
                    event.scoresRevealed 
                      ? 'bg-yellow-500/5 border-yellow-500/20 text-yellow-400' 
                      : 'bg-zinc-900 border-zinc-800 text-zinc-500 hover:text-zinc-300'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Trophy size={16} />
                    LEADERBOARD {event.scoresRevealed ? 'PUBLIC' : 'LOCKED'}
                  </div>
                  <div className={`w-2 h-2 rounded-full ${event.scoresRevealed ? 'bg-yellow-500 shadow-[0_0_8px_rgba(234,179,8,0.5)]' : 'bg-zinc-700'}`} />
                </button>
              </div>
            </div>

            {/* Dynamic Controls */}
            {(event.phase === 'building' || event.phase === 'last_call') && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest">Live Clock</label>
                <LiveTimer event={event} onUpdate={updateEvent} />
              </div>
            )}

            {/* Full Sequence Map */}
            <div className="pt-6 border-t border-zinc-900">
               <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4">Sequence Map</label>
               <div className="space-y-1">
                 {PHASES.map((phase, index) => {
                   const isCurrent = phase.id === event.phase;
                   const isPast = index < currentPhaseIndex;
                   const Icon = phase.icon;
                   
                   return (
                     <button
                        key={phase.id}
                        onClick={() => updateEvent({ phase: phase.id })}
                        disabled={!!isUpdating}
                        className={`w-full flex items-center gap-3 p-2 rounded-lg transition-all ${isCurrent ? 'bg-white/5 text-white' : 'text-zinc-500 hover:bg-white/5 hover:text-zinc-300'}`}
                     >
                        <div className={`w-7 h-7 flex items-center justify-center rounded-md ${isCurrent ? 'bg-emerald-500 text-zinc-950' : 'bg-zinc-900 text-zinc-600'}`}>
                           <Icon size={14} />
                        </div>
                        <span className="text-[10px] font-bold uppercase tracking-widest">{phase.label}</span>
                        {isCurrent && <div className="ml-auto w-1 h-3 bg-emerald-500 rounded-full" />}
                     </button>
                   );
                 })}
               </div>
            </div>
          </div>

          <div className="p-6 bg-zinc-900/30 border-t border-zinc-900 text-center">
             <p className="text-[9px] text-zinc-600 font-medium uppercase tracking-widest leading-relaxed">
               Use these controls to synchronize<br />the arena for all participants.
             </p>
          </div>
        </Card>
      </div>

      {/* Backdrop for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  );
}
