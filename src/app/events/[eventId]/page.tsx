'use client';

import { useState, useMemo, Suspense, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { ChevronLeft, Loader2, LayoutGrid, Trophy, Calendar, MapPin, Share2, UserPlus, Send, CheckCircle, Clock } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TeamGallery } from '@/components/gallery/TeamGallery';
import { LeaderboardTable } from '@/components/leaderboard/LeaderboardTable';
import { useEvents } from '@/hooks/useEvents';
import { useAuth } from '@/context/AuthContext';
import { useRegistration } from '@/hooks/useRegistration';
import { useVoting } from '@/context/VotingContext';
import { SignInModal } from '@/components/auth/SignInModal';
import { RegisterModal } from '@/components/events/RegisterModal';
import { getEventStatus } from '@/lib/utils';

function EventArenaPage() {
  const { eventId } = useParams();
  const router = useRouter();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useVoting();
  const { getEventById, isLoading: isEventsLoading } = useEvents();
  const { registration, isRegistering, register, isLoading: isRegLoading } = useRegistration(eventId as string);
  
  const [activeTab, setActiveTab] = useState<'gallery' | 'leaderboard'>('gallery');
  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);

  const event = useMemo(() => 
    typeof eventId === 'string' ? getEventById(eventId) : undefined
  , [eventId, getEventById]);

  // Redirect to new vanity URL if event has a slug
  useEffect(() => {
    if (event?.slug) {
      router.replace(`/e/${event.slug}`);
    }
  }, [event, router]);

  // Automatically open registration modal after signing in if we were in the middle of joining
  useEffect(() => {
    if (isAuthenticated && isSignInModalOpen) {
      setIsSignInModalOpen(false);
      setIsRegisterModalOpen(true);
    }
  }, [isAuthenticated, isSignInModalOpen]);

  const isLoading = isEventsLoading || isRegLoading;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (!event) {
    return (
      <Card className="p-12 text-center max-w-2xl mx-auto mt-20 border-zinc-800 bg-zinc-950">
        <h2 className="text-2xl font-bold text-white mb-4">Arena Not Found</h2>
        <p className="text-zinc-500 mb-8">This arena may have been moved or archived.</p>
        <Link href="/events">
          <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-bold px-8">
            BACK TO GLOBAL DISCOVERY
          </Button>
        </Link>
      </Card>
    );
  }

  const status = getEventStatus(event.startDate, event.endDate);
  const isRegistrationOpen = status === 'upcoming' || status === 'active';
  const isApproved = registration?.status === 'approved';
  const isWaitlisted = registration?.status === 'waitlisted';

  const handleRegisterClick = () => {
    if (!isAuthenticated) {
      setIsSignInModalOpen(true);
      return;
    }
    setIsRegisterModalOpen(true);
  };

  const handleConfirmRegistration = async (metadata: { skillLevel: string; teamIntent: string }) => {
    try {
      const result = await register(metadata);
      showToast(result.message, result.status === 'approved' ? 'success' : 'info');
    } catch (err: any) {
      console.error('Registration failed:', err);
      showToast(err.message || 'Registration failed', 'error');
    } finally {
      setIsRegisterModalOpen(false);
    }
  };

  return (
    <div className="space-y-8 pb-20">
      {/* Back Link & Navigation */}
      <div className="flex items-center justify-between">
        <Link 
          href="/events" 
          className="group flex items-center gap-2 text-zinc-500 hover:text-white transition-colors"
        >
          <div className="p-1.5 rounded-lg bg-zinc-900 border border-zinc-800 group-hover:border-zinc-700">
            <ChevronLeft size={16} />
          </div>
          <span className="text-sm font-medium">Global Discovery</span>
        </Link>
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="sm" className="text-zinc-500 hover:text-white">
            <Share2 size={16} className="mr-2" />
            Share Arena
          </Button>
        </div>
      </div>

      {/* Arena Header Card */}
      <Card className="p-8 border-zinc-800 bg-zinc-900/40 relative overflow-hidden backdrop-blur-sm">
        {/* Glow effect */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[100px] -z-10" />
        
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
          <div className="space-y-4 flex-1">
            <div className="flex items-center gap-3">
              <Badge variant="outline" className={`
                ${status === 'active' ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5' : 
                  status === 'upcoming' ? 'border-violet-500/30 text-violet-400 bg-violet-500/5' : 
                  'border-zinc-700 text-zinc-500'}
              `}>
                {status === 'active' && <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse mr-1.5" />}
                {status.toUpperCase()} ARENA
              </Badge>
              <div className="flex items-center gap-1.5 text-zinc-400 text-sm font-medium">
                <MapPin size={14} className="text-emerald-400" />
                {event.location}
              </div>
            </div>
            
            <h1 className="text-4xl font-black text-white tracking-tight">{event.name}</h1>
            <p className="text-zinc-400 max-w-2xl leading-relaxed">{event.description}</p>
            
            <div className="flex items-center gap-6 pt-2">
               <div className="flex items-center gap-2 text-zinc-300 text-sm">
                  <Calendar size={16} className="text-emerald-400" />
                  {new Date(event.startDate).toLocaleDateString('en-US', { day: 'numeric', month: 'long', year: 'numeric' })}
               </div>
            </div>
          </div>

          {/* Action Center */}
          <div className="flex flex-col gap-3 min-w-[240px]">
            {isRegistrationOpen && !registration && (
              <Button 
                size="lg"
                onClick={handleRegisterClick}
                className="w-full bg-white text-zinc-950 hover:bg-zinc-200 font-black rounded-xl h-14 transition-all active:scale-95"
              >
                <UserPlus size={20} className="mr-2" />
                REGISTER TO BUILD
              </Button>
            )}

            {isApproved && (
              <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 mb-1">
                <CheckCircle className="text-emerald-500" size={20} />
                <span className="text-sm font-bold text-emerald-400 uppercase tracking-wider">Registered</span>
              </div>
            )}

            {isWaitlisted && (
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20 flex items-center gap-3 mb-1">
                <Clock className="text-yellow-500" size={20} />
                <span className="text-sm font-bold text-yellow-500 uppercase tracking-wider">On Waitlist</span>
              </div>
            )}

            {status === 'active' && isApproved ? (
              <Link href={`/submit?eventId=${event.id}`}>
                <Button 
                  size="lg"
                  variant="secondary"
                  className="w-full border-emerald-500/30 text-emerald-400 bg-emerald-500/5 hover:bg-emerald-500/10 font-bold rounded-xl h-14 transition-all active:scale-95"
                >
                  <Send size={20} className="mr-2" />
                  SUBMIT PROJECT
                </Button>
              </Link>
            ) : status === 'active' && !registration ? (
              <Button 
                size="lg"
                variant="secondary"
                onClick={handleRegisterClick}
                className="w-full border-zinc-700 text-zinc-400 bg-zinc-900 hover:bg-zinc-800 font-bold rounded-xl h-14 transition-all active:scale-95"
              >
                <UserPlus size={20} className="mr-2" />
                JOIN TO SUBMIT
              </Button>
            ) : status === 'upcoming' ? (
              <div className="p-4 rounded-xl bg-zinc-950/50 border border-zinc-800 text-center">
                <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest leading-relaxed">Submissions open when<br/>arena goes live</p>
              </div>
            ) : null}
          </div>
        </div>
      </Card>

      {/* Custom Tab Navigation */}
      <div className="flex p-1 bg-zinc-900 border border-zinc-800 rounded-xl w-fit">
        <button
          onClick={() => setActiveTab('gallery')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'gallery' 
              ? 'bg-zinc-800 text-white shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <LayoutGrid size={18} className={activeTab === 'gallery' ? 'text-emerald-400' : ''} />
          Project Gallery
        </button>
        <button
          onClick={() => setActiveTab('leaderboard')}
          className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-bold transition-all ${
            activeTab === 'leaderboard' 
              ? 'bg-zinc-800 text-white shadow-lg' 
              : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          <Trophy size={18} className={activeTab === 'leaderboard' ? 'text-yellow-400' : ''} />
          Wall of Fame
        </button>
      </div>

      {/* Tab Content */}
      <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
        {activeTab === 'gallery' ? (
          <TeamGallery eventId={typeof eventId === 'string' ? eventId : undefined} />
        ) : (
          <div className="max-w-4xl">
            <LeaderboardTable eventId={typeof eventId === 'string' ? eventId : undefined} />
          </div>
        )}
      </div>

      <RegisterModal 
        isOpen={isRegisterModalOpen}
        onClose={() => setIsRegisterModalOpen(false)}
        onConfirm={handleConfirmRegistration}
        isWaitlist={(event.maxParticipants || 0) <= (event.currentRegistrations || 0)}
      />

      <SignInModal 
        isOpen={isSignInModalOpen} 
        onClose={() => setIsSignInModalOpen(false)}
        title={`Register for ${event.name}`}
        description="Create an account or sign in to register for this buildathon and get live updates."
      />
    </div>
  );
}

export default function EventsEventPage() {
  return (
    <Suspense fallback={
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    }>
      <EventArenaPage />
    </Suspense>
  );
}
