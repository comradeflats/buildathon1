'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Loader2, AlertCircle, LayoutGrid, Trophy, Search, Filter } from 'lucide-react';
import { VotingForm } from '@/components/voting/VotingForm';
import { SignInPrompt } from '@/components/auth/SignInPrompt';
import { useVoting } from '@/context/VotingContext';
import { useTeams } from '@/context/TeamContext';
import { useAuth } from '@/context/AuthContext';
import { useEvents } from '@/hooks/useEvents';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { isTeamOwner, hasSubmittedToEvent } from '@/lib/ownership';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { getThemeEmoji } from '@/lib/themeIcons';
import { useState, useMemo } from 'react';

export default function VotePage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const teamId = searchParams.get('teamId');
  const eventId = searchParams.get('event');
  
  const { getTeamById, teams, isLoading } = useTeams();
  const { user, isAuthenticated, isLoading: authLoading, ownershipToken } = useAuth();
  const { getEventById, isLoading: isEventsLoading } = useEvents();
  const { getThemeById } = useVoting();

  const [searchQuery, setSearchQuery] = useState('');

  const team = teamId ? getTeamById(teamId) : null;
  const event = useMemo(() => {
    if (team) return getEventById(team.eventId);
    if (eventId) return getEventById(eventId);
    return null;
  }, [team, eventId, getEventById]);

  const { isJudge, isAdmin, isOwner, isLoading: permsLoading } = useOrgPermissions(event?.organizationId || null);

  const eventTeams = useMemo(() => {
    if (!event) return [];
    return teams.filter(t => t.eventId === event.id);
  }, [event, teams]);

  const filteredTeams = useMemo(() => {
    return eventTeams.filter(t => 
      t.projectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [eventTeams, searchQuery]);

  if (isLoading || authLoading || permsLoading || isEventsLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-accent" />
      </div>
    );
  }

  // If a specific team is selected, show the voting form
  if (team) {
    // Show sign-in prompt if not authenticated
    if (!isAuthenticated) {
      return (
        <div className="max-w-2xl mx-auto py-10 px-4">
          <Link
            href={event?.slug ? `/e/${event.slug}` : (eventId ? `/events/${eventId}` : "/events")}
            className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
          >
            <ArrowLeft size={20} />
            Back to Portal
          </Link>
          <SignInPrompt
            title="Sign in to Vote"
            description={`Sign in to submit your vote for "${team.projectName}". Your vote helps decide the winners.`}
          />
        </div>
      );
    }

    // EXPERT JUDGING LOGIC
    if (event?.votingModel === 'expert') {
      if (!isJudge && !isAdmin && !isOwner) {
        return (
          <div className="max-w-2xl mx-auto py-10 px-4">
            <Link
              href={event?.slug ? `/e/${event.slug}` : (eventId ? `/events/${eventId}` : "/events")}
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              Back to Portal
            </Link>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-red-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Expert Judging Only
              </h2>
              <p className="text-zinc-400 mb-6">
                This event uses an expert judging model. Only designated judges from the organization can vote.
              </p>
              <Link
                href={eventId ? `/vote?event=${eventId}` : "/"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
              >
                Browse Projects
              </Link>
            </div>
          </div>
        );
      }
    } else {
      // PEER VOTING LOGIC
      if (isTeamOwner(team, user, ownershipToken)) {
        return (
          <div className="max-w-2xl mx-auto py-10 px-4">
            <Link
              href={event?.slug ? `/e/${event.slug}` : (eventId ? `/events/${eventId}` : "/events")}
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              Back to Portal
            </Link>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-amber-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-amber-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Cannot Vote on Your Own Project
              </h2>
              <p className="text-zinc-400 mb-6">
                You submitted "{team.projectName}", so you cannot vote on it.
              </p>
              <Link
                href={eventId ? `/vote?event=${eventId}` : "/"}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
              >
                Browse Other Projects
              </Link>
            </div>
          </div>
        );
      }

      if (!hasSubmittedToEvent(teams, team.eventId, user, ownershipToken) && !isAdmin) {
        return (
          <div className="max-w-2xl mx-auto py-10 px-4">
            <Link
              href={event?.slug ? `/e/${event.slug}` : (eventId ? `/events/${eventId}` : "/events")}
              className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-6"
            >
              <ArrowLeft size={20} />
              Back to Portal
            </Link>
            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-8 text-center">
              <div className="w-16 h-16 bg-blue-500/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertCircle className="w-8 h-8 text-blue-500" />
              </div>
              <h2 className="text-xl font-semibold text-white mb-2">
                Submit a Project First
              </h2>
              <p className="text-zinc-400 mb-6">
                To vote on projects in this event, you must first submit your own project.
              </p>
              <Link
                href={`/submit?eventId=${team.eventId}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-accent hover:bg-accent-hover text-white font-medium rounded-lg transition-colors"
              >
                Submit Your Project
              </Link>
            </div>
          </div>
        );
      }
    }

    return <VotingForm team={team} />;
  }

  // If no team selected but event ID provided, show the voting portal gallery
  if (event) {
    return (
      <div className="max-w-6xl mx-auto py-10 px-4">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <Link
              href={`/e/${event.slug || event.id}`}
              className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4"
            >
              <ArrowLeft size={16} />
              Back to Arena
            </Link>
            <h1 className="text-4xl font-black text-white tracking-tight">Voting Portal</h1>
            <p className="text-zinc-400 mt-2">
              Select a project from <span className="text-emerald-400 font-bold">{event.name}</span> to cast your vote.
            </p>
          </div>

          <div className="relative group w-full md:w-80">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-emerald-500 transition-colors" size={18} />
            <input 
              type="text" 
              placeholder="Search projects or builders..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-zinc-900 border border-zinc-800 rounded-2xl pl-12 pr-4 py-3 text-white focus:outline-none focus:border-emerald-500/50 transition-all shadow-inner"
            />
          </div>
        </div>

        {filteredTeams.length === 0 ? (
          <Card className="p-20 text-center border-dashed border-zinc-800 bg-zinc-950/50">
            <LayoutGrid size={48} className="mx-auto text-zinc-800 mb-4" />
            <h3 className="text-xl font-bold text-zinc-500">No projects found</h3>
            <p className="text-zinc-600 mt-2">Try adjusting your search or wait for submissions to roll in.</p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTeams.map((t) => {
              const theme = getThemeById(t.themeId);
              const isUserTeam = isTeamOwner(t, user, ownershipToken);
              
              return (
                <Card 
                  key={t.id} 
                  className={`group relative overflow-hidden transition-all duration-300 hover:border-emerald-500/50 hover:shadow-[0_0_30px_rgba(16,185,129,0.1)] flex flex-col h-full ${isUserTeam ? 'border-emerald-500/20' : ''}`}
                >
                  <div className="p-6 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl" title={theme?.name}>{getThemeEmoji(theme)}</span>
                        <div>
                           <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors line-clamp-1">{t.projectName}</h3>
                           <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">{t.name}</p>
                        </div>
                      </div>
                      {isUserTeam && (
                        <Badge variant="success" className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20 text-[10px]">YOURS</Badge>
                      )}
                    </div>
                    
                    <p className="text-sm text-zinc-400 line-clamp-2 mb-6 flex-1">
                      {t.description}
                    </p>

                    <div className="space-y-4">
                       <div className="flex flex-wrap gap-1.5">
                          {t.techStack.slice(0, 3).map(tech => (
                             <Badge key={tech} className="bg-zinc-800 border-zinc-700 text-zinc-400 text-[9px]">{tech}</Badge>
                          ))}
                          {t.techStack.length > 3 && <span className="text-[9px] text-zinc-600 font-bold">+{t.techStack.length - 3}</span>}
                       </div>

                       <Button 
                          onClick={() => router.push(`/vote?teamId=${t.id}&event=${event.id}`)}
                          className={`w-full h-11 rounded-xl font-black text-xs tracking-widest ${isUserTeam ? 'bg-zinc-800 text-zinc-500 cursor-not-allowed' : 'bg-emerald-500 hover:bg-emerald-600 text-zinc-950 shadow-lg shadow-emerald-500/10'}`}
                          disabled={isUserTeam}
                       >
                          {isUserTeam ? 'CANNOT VOTE OWN' : 'CAST YOUR VOTE'}
                       </Button>
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    );
  }

  // Fallback for no event ID and no team ID
  return (
    <div className="max-w-2xl mx-auto text-center py-20 px-4">
      <h1 className="text-2xl font-bold text-white mb-4">Portal Misaligned</h1>
      <p className="text-zinc-400 mb-6">
        We need an event context to show you the projects. Please return to the event page.
      </p>
      <Link
        href="/events"
        className="inline-flex items-center gap-2 px-8 py-3 bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black rounded-xl transition-all"
      >
        <ArrowLeft size={20} />
        Browse Arenas
      </Link>
    </div>
  );
}
