'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Users, Loader2, Plus, Clock, 
  MapPin, Settings, Info, CheckCircle, AlertCircle,
  Trophy, LayoutGrid, Sparkles, UserPlus, Activity, LogOut, ShieldCheck, LayoutPanelLeft, ChevronRight
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EventPhaseController } from '@/components/admin/EventPhaseController';
import { PhaseBanner } from '@/components/events/PhaseBanner';
import { TeamGallery, LiveStageTracker } from '@/components/gallery/TeamGallery';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { useEventBySlug } from '@/hooks/useEventBySlug';
import { useTeams } from '@/hooks/useTeams';
import { useThemes } from '@/hooks/useThemes';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { useRegistration } from '@/hooks/useRegistration';
import { getThemeEmoji, getThemeIconColor } from '@/lib/themeIcons';
import { getEventStatus } from '@/lib/utils';
import { useAuth } from '@/context/AuthContext';
import { useVoting } from '@/context/VotingContext';
import { RegisterModal } from '@/components/events/RegisterModal';
import { SignInModal } from '@/components/auth/SignInModal';

function ParticipantTimer({ event }: { event: any }) {
  const [timeLeft, setTimeLeft] = useState<number>(0);

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
    }, 1000);

    return () => clearInterval(interval);
  }, [event.timerEndTime, event.isTimerPaused, event.timerSecondsLeft]);

  const formatTime = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h > 0 ? h + ':' : ''}${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  if (timeLeft === 0 && !event.isTimerPaused) return null;

  return (
    <div className={`flex flex-col items-center justify-center px-6 py-2 rounded-2xl border ${timeLeft < 300 ? 'border-red-500 bg-red-500/10' : 'border-emerald-500/20 bg-emerald-500/5'}`}>
      <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Time Remaining</span>
      <div className={`text-3xl font-black tabular-nums tracking-tighter ${timeLeft < 300 ? 'text-red-500 animate-pulse' : 'text-emerald-400'}`}>
        {formatTime(timeLeft)}
      </div>
    </div>
  );
}

export default function EventBySlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useVoting();

  const { event, isLoading: isEventLoading, error } = useEventBySlug(slug);
  const { teams, isLoading: isTeamsLoading } = useTeams();
  const { themes, isLoading: isThemesLoading } = useThemes();
  const { isAdmin, isLoading: isPermsLoading } = useOrgPermissions(event?.organizationId || null);
  const { registration, isRegistering, register, withdraw, isLoading: isRegLoading } = useRegistration(event?.id);

  const [isJoining, setIsJoining] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [selectedThemeId, setSelectedThemeId] = useState<string | null>(null);

  // Automatically open registration modal after signing in if we were in the middle of joining
  useEffect(() => {
    if (isAuthenticated && isSignInModalOpen) {
      setIsSignInModalOpen(false);
      setIsModalOpen(true);
    }
  }, [isAuthenticated, isSignInModalOpen]);

  const isLoading = isEventLoading || isTeamsLoading || isThemesLoading || isPermsLoading || isRegLoading;

  const eventTeams = event ? teams.filter((team) => team.eventId === event.id) : [];
  const eventThemes = event ? themes.filter((theme) => theme.eventId === event.id) : [];

  // Initialize selected theme
  useEffect(() => {
    if (eventThemes.length > 0 && !selectedThemeId) {
      setSelectedThemeId(eventThemes[0].id);
    }
  }, [eventThemes, selectedThemeId]);

  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
      return;
    }
    setIsModalOpen(true);
  };

  const handleConfirmRegistration = async (metadata: { skillLevel: string; teamIntent: string }) => {
    try {
      const result = await register(metadata);
      showToast(result.message, result.status === 'approved' ? 'success' : 'info');
    } catch (err: any) {
      console.error('Registration failed:', err);
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsJoining(false);
    }
  };

  const handleWithdraw = async () => {
    if (!confirm('Are you sure you want to withdraw? This will free up your spot for someone on the waitlist.')) {
      return;
    }

    try {
      await withdraw();
      showToast('Successfully withdrawn from event', 'info');
    } catch (err: any) {
      showToast(err.message || 'Failed to withdraw', 'error');
    }
  };

  const handleRegister = async () => {
    handleRegisterClick();
  };

  const formatEventDates = (startDate?: string, endDate?: string) => {
    if (!startDate || !endDate) return null;
    const start = new Date(startDate);
    const end = new Date(endDate);
    return `${start.toLocaleDateString('en-GB')} – ${end.toLocaleDateString('en-GB')}`;
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    const dateStr = date.toLocaleDateString('en-GB');
    const timeStr = date.toLocaleTimeString('en-GB', { hour: 'numeric', minute: '2-digit', hour12: true });
    return `${dateStr}, ${timeStr}`;
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center">
        <Calendar size={48} className="text-zinc-600 mb-4" />
        <h2 className="text-xl font-semibold text-white mb-2">Event Not Found</h2>
        <p className="text-zinc-400 mb-6">
          The event you&apos;re looking for doesn&apos;t exist or has been removed.
        </p>
        <Link href="/events" className="text-accent hover:underline flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>
    );
  }

  const status = getEventStatus(event.startDate, event.endDate, event.themesGenerated, event.isLive);
  const dateRange = formatEventDates(event.startDate, event.endDate);
  const isApproved = registration?.status === 'approved';
  const canSubmit = (status === 'active' && event.phase === 'building') && isApproved;
  const publishedThemes = eventThemes.filter(t => t.isPublished);

  const renderContent = () => {
    // 1. UPCOMING FLOW
    if (status === 'upcoming') {
      return (
        <div className="space-y-8">
          <div className="relative overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900/20">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-yellow-500/5 via-transparent to-accent/5 -z-10" />

            <div className="px-6 py-8 md:px-8 md:py-10 flex flex-col md:flex-row items-start justify-between gap-6 relative z-10">
              <div className="text-left space-y-4 flex-1">
                 <div className="flex flex-wrap items-center gap-2">
                   <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20 font-bold px-2 py-0.5 text-[10px] uppercase tracking-wider">Upcoming</Badge>
                   <div className="flex items-center gap-1.5 text-zinc-500 text-[10px] font-bold uppercase tracking-wider">
                     <Users size={12} />
                     {event.currentRegistrations || 0} Joined
                   </div>
                 </div>

                 <h1 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-[0.95]">
                   {event.name}
                 </h1>

                 <p className="text-base text-zinc-400 max-w-xl leading-snug">
                   {event.description}
                 </p>

                 <div className="flex flex-wrap items-start gap-6 pt-2">
                    <div className="space-y-0.5 max-w-md">
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Location</p>
                      <p className="text-sm font-bold text-white flex items-start gap-1.5">
                        <MapPin size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                        <span className="leading-snug">{event.location || 'TBA'}</span>
                      </p>
                    </div>
                    <div className="w-px h-8 bg-zinc-800 hidden md:block" />
                    <div className="space-y-0.5">
                      <p className="text-[9px] text-zinc-500 font-black uppercase tracking-widest">Date & Time</p>
                      <p className="text-sm font-bold text-white flex items-center gap-1.5">
                        <Calendar size={14} className="text-accent" />
                        {formatDateTime(event.startDate)}
                      </p>
                    </div>
                 </div>
              </div>

              <div className="w-full md:w-80 shrink-0">
                <Card className="p-5 border-accent/20 bg-black/40 backdrop-blur-xl rounded-xl shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-accent/10 blur-[40px] -z-10 group-hover:bg-accent/20 transition-colors" />

                  <h3 className="text-lg font-black text-white mb-4 flex items-center gap-2">
                    <Sparkles size={18} className="text-accent" />
                    Secure Your Spot
                  </h3>

                  {registration ? (
                    <div className="space-y-4">
                      <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                        isApproved ? 'bg-emerald-500/5 border-emerald-500/20' : 'bg-yellow-500/5 border-yellow-500/20'
                      }`}>
                        <div className={`p-1.5 rounded-lg ${isApproved ? 'bg-emerald-500/10 text-emerald-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                          {isApproved ? <CheckCircle size={18} /> : <Clock size={18} />}
                        </div>
                        <div>
                          <p className={`font-black text-base ${isApproved ? 'text-emerald-400' : 'text-yellow-400'}`}>
                            {isApproved ? 'You\'re In!' : 'Waitlisted'}
                          </p>
                          <p className="text-xs text-zinc-500 mt-0.5 leading-snug">
                            {isApproved
                              ? "Registration confirmed. Prepare your tools!"
                              : "At capacity. You'll be notified if a spot opens."}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={handleWithdraw}
                        disabled={isRegistering}
                        className="w-full text-[9px] font-black text-zinc-600 hover:text-red-400 uppercase tracking-wider transition-colors"
                      >
                        Withdraw
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-xs text-zinc-400 leading-snug">
                        Join the community of builders. Limited spots available.
                      </p>
                      <Button
                        onClick={handleRegisterClick}
                        disabled={isRegistering || isJoining}
                        className="w-full h-12 text-base font-black rounded-xl shadow-lg shadow-accent/20"
                      >
                        {isRegistering || isJoining ? (
                          <Loader2 size={18} className="animate-spin" />
                        ) : (
                          <>
                            <UserPlus size={18} className="mr-2" />
                            JOIN NOW
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </Card>
              </div>
            </div>
          </div>

          {publishedThemes.length > 0 && (
            <section className="space-y-6">
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-black text-white flex items-center gap-3 italic tracking-tighter">
                    <Sparkles size={24} className="text-accent" />
                    THEME LEAKS
                  </h2>
                  <p className="text-sm text-zinc-500 font-medium max-w-xl leading-snug">
                    Our intelligence suggests these themes will be featured. Full criteria remains classified until the arena goes live.
                  </p>
                </div>
                <Badge variant="outline" className="border-accent/30 text-accent bg-accent/5 px-3 py-1 rounded-full font-bold text-[10px] uppercase tracking-wider">
                  System Status: encrypted
                </Badge>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {publishedThemes.map((theme) => (
                  <div key={theme.id} className="p-5 rounded-xl border border-zinc-800 bg-zinc-900/40 relative overflow-hidden group hover:bg-zinc-900/60 transition-all duration-300">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                      <Sparkles size={48} className="text-accent" />
                    </div>
                    <div className="w-12 h-12 mb-4 rounded-lg bg-zinc-800/50 flex items-center justify-center text-accent transform group-hover:scale-105 transition-transform duration-300">
                      <LayoutPanelLeft size={24} />
                    </div>
                    <h3 className="text-lg font-black text-white mb-2 tracking-tight">{theme.name}</h3>
                    <div className="space-y-2 mb-4">
                      <p className="text-xs text-zinc-500 italic blur-[3px] select-none leading-snug line-clamp-2">
                        {theme.concept || "Classified information. Encryption level: High."}
                      </p>
                      <div className="h-1.5 bg-zinc-800 rounded-full w-2/3 animate-pulse" />
                    </div>
                    <div className="inline-flex items-center gap-1.5 text-[9px] font-black text-accent uppercase tracking-wider bg-accent/10 px-2.5 py-1 rounded-full">
                      <div className="w-1 h-1 rounded-full bg-accent animate-ping" />
                      Intercepted
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      );
    }

    // 2. ACTIVE FLOW
    if (status === 'active') {
      const isReviewPhase = event.phase === 'review';
      const isJudgingPhase = event.phase === 'judging';
      const isResultsPhase = event.phase === 'results';
      const showLeaderboard = isJudgingPhase || isResultsPhase;

      return (
        <div className="space-y-8 animate-in fade-in duration-1000">
          <PhaseBanner phase={event.phase || 'building'} />

          <div className="relative px-8 py-10 rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 overflow-hidden">
            <div className="absolute top-0 right-0 w-1/2 h-full bg-gradient-to-l from-emerald-500/5 to-transparent -z-10" />
            <div className="flex flex-col md:flex-row items-center justify-between gap-8">
              <div className="space-y-4 text-center md:text-left">
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
                  <Badge variant="success" className="bg-emerald-500 text-zinc-950 font-black px-2 py-0.5 rounded-md animate-pulse">LIVE ARENA</Badge>
                  <h1 className="text-4xl md:text-5xl font-black text-white tracking-tighter italic">{event.name}</h1>
                </div>
                <div className="flex flex-wrap items-start justify-center md:justify-start gap-6 text-zinc-400 text-sm font-medium uppercase tracking-widest">
                  <span className="flex items-start gap-2"><MapPin size={14} className="text-emerald-500 mt-0.5 shrink-0" /> <span className="normal-case">{event.location}</span></span>
                  <span className="flex items-center gap-2"><Clock size={14} className="text-accent" /> Ends {formatDateTime(event.endDate)}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center justify-center gap-4">
                 <Link href={`/e/${slug}/gallery`}>
                   <Button variant="secondary" className="h-14 px-8 rounded-2xl font-black border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800">
                     <LayoutGrid size={20} className="mr-2" />
                     VIEW GALLERY
                   </Button>
                 </Link>
                 {canSubmit ? (
                   <Link href={`/submit?eventId=${event.id}`}>
                     <Button size="lg" className="h-14 px-8 text-lg font-black shadow-xl shadow-accent/20 rounded-2xl bg-white text-zinc-950 hover:bg-zinc-200">
                       <Plus size={20} className="mr-2" />
                       SUBMIT PROJECT
                     </Button>
                   </Link>
                 ) : isReviewPhase ? (
                    <Link href={`/vote?event=${event.id}`}>
                      <Button size="lg" className="h-14 px-8 text-lg font-black shadow-xl shadow-pink-500/20 rounded-2xl bg-pink-500 text-white hover:bg-pink-600">
                        <Trophy size={20} className="mr-2" />
                        VOTING PORTAL
                      </Button>
                    </Link>
                 ) : !registration && (event.phase === 'registration' || event.phase === 'building') ? (
                   <Button onClick={handleRegisterClick} className="h-14 px-8 rounded-2xl font-black">
                     JOIN EVENT
                   </Button>
                 ) : null}
              </div>
            </div>
          </div>

          {/* Dynamic Content based on Phase */}
          <div className="space-y-12">
            {/* 1. Stats & Timer */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-black text-white">{event.currentRegistrations || 0}</p>
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Builders Joined</p>
              </div>
              <div className="p-4 rounded-2xl bg-zinc-900/30 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                  <p className="text-xl font-black text-white">{eventTeams.length}</p>
                  <p className="text-[9px] text-zinc-500 uppercase font-black tracking-widest">Projects Shipped</p>
              </div>
              {(event.phase === 'building' || event.phase === 'last_call') && (
                <div className="col-span-2">
                    <ParticipantTimer event={event} />
                </div>
              )}
            </div>

            {/* 2. The Challenge (Themes) */}
            {!isResultsPhase && (
              <div className="rounded-[2.5rem] bg-zinc-900/20 border border-zinc-800 overflow-hidden">
                <div className="grid lg:grid-cols-5 divide-y lg:divide-y-0 lg:divide-x divide-zinc-800">
                  <div className="lg:col-span-3 p-8 md:p-12 space-y-10">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 italic">
                      <Sparkles size={32} className="text-emerald-400" />
                      THE CHALLENGE
                    </h2>
                    <div className="space-y-4">
                      {eventThemes.map((theme) => {
                        const isSelected = selectedThemeId === theme.id;
                        const themeColor = getThemeIconColor(theme);
                        
                        return (
                          <button 
                            key={theme.id} 
                            onClick={() => setSelectedThemeId(theme.id)}
                            className={`w-full text-left group p-6 rounded-3xl transition-all duration-500 border ${
                              isSelected 
                                ? `bg-white/5 border-zinc-400 shadow-xl` 
                                : 'bg-black/20 border-zinc-800/50 hover:border-zinc-700'
                            }`}
                          >
                            <div className="flex items-start gap-6">
                              <div className={`w-14 h-14 shrink-0 rounded-2xl bg-zinc-800 flex items-center justify-center ${isSelected ? themeColor : 'text-zinc-500'}`}>
                                <LayoutPanelLeft size={28} />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h3 className={`text-xl font-black mb-1 tracking-tight ${isSelected ? 'text-white' : 'text-zinc-400'}`}>{theme.name}</h3>
                                <p className={`leading-relaxed text-sm line-clamp-2 ${isSelected ? 'text-zinc-300' : 'text-zinc-500'}`}>{theme.concept}</p>
                              </div>
                              {isSelected && (
                                <div className={`w-2 h-2 rounded-full mt-2 ${themeColor.replace('text-', 'bg-')} shadow-[0_0_10px_currentColor]`} />
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                  <div className="lg:col-span-2 p-8 md:p-12 bg-black/20">
                    <h2 className="text-3xl font-black text-white flex items-center gap-4 italic mb-10">
                      <ShieldCheck size={32} className="text-yellow-500" />
                      STANDARDS
                    </h2>
                    <div className="space-y-6">
                      {(() => {
                        const selectedTheme = eventThemes.find(t => t.id === selectedThemeId) || eventThemes[0];
                        const themeColor = getThemeIconColor(selectedTheme);
                        
                        return selectedTheme?.judgingCriteria?.map((criterion, idx) => (
                          <div key={idx} className="flex gap-5 group animate-in fade-in slide-in-from-right-4 duration-500" style={{ animationDelay: `${idx * 100}ms` }}>
                            <span className={`text-2xl font-black transition-colors ${themeColor}`}>0{idx + 1}</span>
                            <p className="text-zinc-300 text-sm leading-relaxed font-medium">{criterion}</p>
                          </div>
                        ));
                      })()}
                    </div>
                    {registration && (
                      <div className="mt-12 pt-8 border-t border-zinc-800">
                        <button onClick={handleWithdraw} className="text-[10px] font-black text-zinc-600 hover:text-red-400 uppercase tracking-[0.2em] transition-colors">Withdraw from Arena</button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}
            
            {/* 3. Community Hub (Gallery & Leaderboard) */}
            <section className="pt-8 border-t border-zinc-900 animate-in fade-in slide-in-from-bottom-4 duration-1000">
               <TeamGallery eventId={event.id} />
            </section>
          </div>
        </div>
      );
    }

    // 3. ARCHIVED FLOW
    return (
      <div className="space-y-8 max-w-5xl mx-auto pb-20 relative">
        <div className="text-center space-y-4 pb-8">
          <Badge variant="secondary" className="mb-2">Completed</Badge>
          <h1 className="text-5xl font-black text-white tracking-tight">{event.name}</h1>
          <p className="text-xl text-zinc-400 max-w-2xl mx-auto">This event has concluded. Explore the amazing projects built by our community.</p>
          <div className="flex items-center justify-center gap-4 pt-4">
            <Link href={`/e/${slug}/gallery`}><Button size="lg" className="h-14 px-8 text-lg font-bold"><LayoutGrid size={20} className="mr-2" />Project Gallery</Button></Link>
            <Link href={`/e/${slug}/leaderboard`}><Button variant="secondary" size="lg" className="h-14 px-8 text-lg font-bold"><Trophy size={20} className="mr-2" />Final Results</Button></Link>
          </div>
        </div>
        <div className="grid md:grid-cols-2 gap-8 border-t border-zinc-800 pt-12">
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">Event Legacy</h2>
            <p className="text-zinc-400 leading-relaxed">{event.description}</p>
            <div className="flex gap-8 py-4">
              <div><p className="text-2xl font-bold text-white">{eventTeams.length}</p><p className="text-sm text-zinc-500">Participants</p></div>
              <div><p className="text-2xl font-bold text-white">{new Date(event.startDate).getFullYear()}</p><p className="text-sm text-zinc-500">Year</p></div>
              <div><p className="text-2xl font-bold text-white">{event.location}</p><p className="text-sm text-zinc-500">Venue</p></div>
            </div>
          </div>
          <div className="space-y-4">
            <h2 className="text-2xl font-bold text-white">The Challenge</h2>
            <div className="space-y-2">
              {eventThemes.map(theme => (
                <div key={theme.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                  <LayoutPanelLeft className="text-emerald-400" size={24} />
                  <span className="font-semibold text-zinc-300">{theme.name}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {renderContent()}
      
      <RegisterModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        isWaitlist={(event.maxParticipants || 0) <= (event.currentRegistrations || 0)}
      />

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)}
        title="Sign in to Register"
        description="You need to be signed in to join the event. You can continue as a guest if you prefer."
        hideGuest={false}
      />

      {isAdmin && <EventPhaseController event={event} />}
      </div>

  );
}
