'use client';

import { useMemo, useState, useEffect } from 'react';
import { TeamCard } from './TeamCard';
import { useVoting } from '@/context/VotingContext';
import { useTeams } from '@/context/TeamContext';
import { useEvents } from '@/hooks/useEvents';
import { useVotes } from '@/hooks/useVotes';
import { useAdmin } from '@/context/AdminContext';
import { Loader2, LayoutGrid, Monitor, Users, CheckCircle2, ChevronRight, AlertCircle, Play, ExternalLink } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';

interface TeamGalleryProps {
  eventId?: string;
}

function LiveStageTracker({ event, teams }: { event: any, teams: any[] }) {
  const { votes } = useVotes();
  const { updateEvent } = useEvents();
  const { isAdmin } = useAdmin();
  const [isTransitioning, setIsTransitioning] = useState(false);
  
  const activeTeamIndex = teams.findIndex(t => t.id === event.activeTeamId);
  const activeTeam = teams[activeTeamIndex];
  const activeTeamVotes = votes.filter(v => v.teamId === event.activeTeamId);
  
  const totalRegistrants = event.currentRegistrations || 0;
  const isVoteComplete = activeTeamVotes.length >= totalRegistrants && totalRegistrants > 0;

  const handleNext = async () => {
    if (!isAdmin || isTransitioning) return;
    setIsTransitioning(true);
    
    try {
      const nextTeam = teams[activeTeamIndex + 1];
      await updateEvent({
        ...event,
        activeTeamId: nextTeam ? nextTeam.id : null
      });
    } catch (err) {
      console.error("Failed to move to next project", err);
    } finally {
      setIsTransitioning(false);
    }
  };

  if (!activeTeam) return null;

  return (
    <Card className="mb-8 overflow-hidden border-purple-500/30 bg-purple-500/5 shadow-2xl shadow-purple-500/10 animate-in fade-in slide-in-from-top-4 duration-500">
      <div className="flex flex-col md:flex-row items-stretch">
        {/* Left: Team Info */}
        <div className="flex-1 p-6 md:p-8 border-b md:border-b-0 md:border-r border-purple-500/20">
          <div className="flex items-center gap-3 mb-4">
            <Badge className="bg-purple-500 text-white animate-pulse">LIVE ON STAGE</Badge>
            <div className="flex items-center gap-2 text-purple-400 text-xs font-black uppercase tracking-widest">
              <Monitor size={14} />
              Presentation Mode
            </div>
          </div>
          
          <h2 className="text-3xl font-black text-white mb-2 tracking-tight">
            {activeTeam.projectName}
          </h2>
          <p className="text-zinc-400 mb-6 line-clamp-2">{activeTeam.description}</p>
          
          <div className="flex flex-wrap items-center gap-4">
            {activeTeam.primaryUrl && (
              <a 
                href={activeTeam.primaryUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 bg-white text-zinc-950 rounded-xl font-bold text-sm hover:bg-zinc-200 transition-colors shadow-lg shadow-white/5"
              >
                <ExternalLink size={16} />
                Open Demo Link
              </a>
            )}
            <div className="flex items-center gap-2 px-4 py-2 bg-zinc-900/50 rounded-xl border border-zinc-800 text-zinc-400 text-sm">
              <Users size={16} />
              <span>{activeTeam.name}</span>
            </div>
          </div>
        </div>

        {/* Right: Voting Progress */}
        <div className="w-full md:w-96 p-6 md:p-8 bg-zinc-950/50 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-black text-zinc-500 uppercase tracking-widest">Voting Progress</span>
            <span className={`text-sm font-black tabular-nums ${isVoteComplete ? 'text-emerald-400' : 'text-purple-400'}`}>
              {activeTeamVotes.length} / {totalRegistrants}
            </span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-zinc-900 rounded-full overflow-hidden mb-4 border border-zinc-800">
            <div 
              className={`h-full transition-all duration-500 ease-out ${isVoteComplete ? 'bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.5)]' : 'bg-purple-500 shadow-[0_0_15px_rgba(168,85,247,0.5)]'}`}
              style={{ width: `${totalRegistrants > 0 ? (activeTeamVotes.length / totalRegistrants) * 100 : 0}%` }}
            />
          </div>

          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider mb-6">
            {isVoteComplete ? (
              <div className="flex items-center gap-1.5 text-emerald-400">
                <CheckCircle2 size={12} />
                Everyone has voted
              </div>
            ) : (
              <div className="flex items-center gap-1.5 text-zinc-500">
                <div className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-ping" />
                Waiting for remaining votes...
              </div>
            )}
          </div>

          {isAdmin && (
            <div className="space-y-3">
              <Button 
                onClick={handleNext}
                disabled={isTransitioning}
                className={`w-full font-black h-11 rounded-xl transition-all ${isVoteComplete ? 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950' : 'bg-zinc-800 text-zinc-500 hover:bg-zinc-700 hover:text-white'}`}
              >
                {isTransitioning ? <Loader2 className="animate-spin" size={18} /> : (
                  <>
                    {activeTeamIndex === teams.length - 1 ? 'FINISH DEMOS' : 'NEXT PROJECT'}
                    <ChevronRight size={18} className="ml-1" />
                  </>
                )}
              </Button>
              {!isVoteComplete && (
                <p className="text-[9px] text-zinc-600 text-center font-medium italic">
                   Tip: You can force "Next" if some participants have left.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </Card>
  );
}

export function TeamGallery({ eventId }: TeamGalleryProps) {
  const { teams, isLoading: isTeamsLoading } = useTeams();
  const { getEventById, isLoading: isEventsLoading } = useEvents();

  const event = eventId ? getEventById(eventId) : null;
  const isLoading = isTeamsLoading || (eventId && isEventsLoading);

  const filteredTeams = useMemo(() => {
    if (!eventId) return teams;
    return teams.filter((team) => team.eventId === eventId);
  }, [teams, eventId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  if (filteredTeams.length === 0) {
    return (
      <div className="text-center py-20 text-zinc-500 bg-zinc-900/20 border border-dashed border-zinc-800 rounded-2xl">
        <LayoutGrid className="mx-auto mb-4 opacity-20" size={48} />
        <p className="font-medium text-white">No teams found in this arena.</p>
        <p className="text-sm mt-1">Check back later or explore other arenas.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {event?.phase === 'review' && (
        <LiveStageTracker event={event} teams={filteredTeams} />
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredTeams.map((team) => (
          <TeamCard key={team.id} team={team} event={event} />
        ))}
      </div>
    </div>
  );
}
