'use client';

import { useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  ArrowLeft, Calendar, Users, Loader2, Plus, Clock, 
  MapPin, Settings, Info, CheckCircle, AlertCircle,
  Trophy, LayoutGrid, Sparkles, UserPlus, Activity, LogOut
} from 'lucide-react';

import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { EventPhaseController } from '@/components/admin/EventPhaseController';
import { useEventBySlug } from '@/hooks/useEventBySlug';
import { useTeams } from '@/hooks/useTeams';
import { useThemes } from '@/hooks/useThemes';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { useRegistration } from '@/hooks/useRegistration';
import { getThemeEmoji } from '@/lib/themeIcons';
import { useAuth } from '@/context/AuthContext';
import { useVoting } from '@/context/VotingContext';
import { RegisterModal } from '@/components/events/RegisterModal';

export default function EventBySlugPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const { user, isAuthenticated, signInAnonymously } = useAuth();
  const { showToast } = useVoting();

  const { event, isLoading: isEventLoading, error } = useEventBySlug(slug);
  const { teams, isLoading: isTeamsLoading } = useTeams();
  const { themes, isLoading: isThemesLoading } = useThemes();
  const { isAdmin, isLoading: isPermsLoading } = useOrgPermissions(event?.organizationId || null);
  const { registration, isRegistering, register, withdraw, isLoading: isRegLoading } = useRegistration(event?.id);

  const [isJoining, setIsJoining] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isLoading = isEventLoading || isTeamsLoading || isThemesLoading || isPermsLoading || isRegLoading;

  const eventTeams = event ? teams.filter((team) => team.eventId === event.id) : [];
  const eventThemes = event ? themes.filter((theme) => theme.eventId === event.id) : [];

  const handleRegisterClick = async () => {
    if (!isAuthenticated) {
      setIsJoining(true);
      try {
        await signInAnonymously();
      } catch (err) {
        console.error('Failed to sign in:', err);
        setIsJoining(false);
        showToast('Failed to sign in', 'error');
        return;
      }
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
    // Legacy handler for backward compatibility within this file's logic if needed
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
        <Link href="/" className="text-accent hover:underline flex items-center gap-2">
          <ArrowLeft size={16} />
          Back to Events
        </Link>
      </div>
    );
  }

  const dateRange = formatEventDates(event.startDate, event.endDate);
  const isApproved = registration?.status === 'approved';
  const isWaitlisted = registration?.status === 'waitlisted';
  const canSubmit = (event.status === 'active' || event.phase !== 'registration') && isApproved;

  // 1. UPCOMING FLOW
  if (event.status === 'upcoming') {
    return (
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
          <div className="space-y-4">
            <Link href="/" className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors">
              <ArrowLeft size={16} />
              Back to Events
            </Link>
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-4xl font-black text-white tracking-tight">{event.name}</h1>
                <Badge variant="default" className="bg-yellow-500/10 text-yellow-500 border-yellow-500/20">
                  Upcoming
                </Badge>
              </div>
              <p className="text-xl text-zinc-400 max-w-2xl">{event.description}</p>
            </div>

            <div className="flex flex-wrap gap-6 text-zinc-300">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-800 rounded-lg text-emerald-400">
                  <MapPin size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Location</p>
                  <p className="font-semibold">{event.location || 'To be announced'}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-800 rounded-lg text-accent">
                  <Calendar size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Date</p>
                  <p className="font-semibold">{dateRange}</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <div className="p-2 bg-zinc-800 rounded-lg text-blue-400">
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-xs text-zinc-500 uppercase font-bold tracking-wider">Availability</p>
                  <p className="font-semibold text-sm">
                    {event.currentRegistrations || 0} Joined 
                    {event.maxParticipants ? ` (${event.maxParticipants - (event.currentRegistrations || 0)} left)` : ''}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <Card className="p-6 md:w-80 border-accent/20 bg-accent/5 backdrop-blur-sm">
            <h3 className="font-bold text-white mb-4 flex items-center gap-2">
              <Sparkles size={18} className="text-accent" />
              Join the Event
            </h3>
            
            {registration ? (
              <div className="space-y-4">
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  isApproved ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-yellow-500/10 border-yellow-500/20'
                }`}>
                  {isApproved ? (
                    <CheckCircle className="text-emerald-500 shrink-0" size={20} />
                  ) : (
                    <Clock className="text-yellow-500 shrink-0" size={20} />
                  )}
                  <div>
                    <p className={`font-bold text-sm ${isApproved ? 'text-emerald-400' : 'text-yellow-500'}`}>
                      {isApproved ? 'Registration Approved' : 'On Waitlist'}
                    </p>
                    <p className="text-xs text-zinc-400 mt-1">
                      {isApproved 
                        ? "You're in! We'll notify you when themes are revealed."
                        : "The event is currently full. We'll move you up if a spot opens."}
                    </p>
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={handleWithdraw}
                  disabled={isRegistering}
                  className="w-full text-zinc-500 hover:text-red-400 hover:bg-red-400/5 h-8 text-xs"
                >
                  Withdraw from Event
                </Button>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-sm text-zinc-400">
                  Register now to secure your spot. Themes and submission criteria will be revealed once the event starts.
                </p>
                <Button 
                  onClick={handleRegisterClick} 
                  disabled={isRegistering || isJoining} 
                  className="w-full h-12 text-lg font-bold"
                >
                  {isRegistering || isJoining ? (
                    <Loader2 size={20} className="animate-spin" />
                  ) : (
                    <>
                      <UserPlus size={20} className="mr-2" />
                      Register to Join
                    </>
                  )}
                </Button>
              </div>
            )}
          </Card>
        </div>

        <RegisterModal 
          isOpen={isModalOpen}
          onClose={() => setIsModalOpen(false)}
          onConfirm={handleConfirmRegistration}
          isWaitlist={(event.maxParticipants || 0) <= (event.currentRegistrations || 0)}
        />

        {isAdmin && <EventPhaseController event={event} />}
      </div>
    );
  }

  // 2. ACTIVE FLOW
  if (event.status === 'active') {
    return (
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Active Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-zinc-800 pb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-black text-white tracking-tight">{event.name}</h1>
              <Badge variant="success" className="animate-pulse">Live Now</Badge>
            </div>
            <div className="flex items-center gap-4 text-zinc-400 text-sm">
              <span className="flex items-center gap-1.5"><MapPin size={14} className="text-emerald-400" /> {event.location}</span>
              <span className="flex items-center gap-1.5"><Clock size={14} className="text-accent" /> Ends: {formatDateTime(event.endDate)}</span>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {canSubmit ? (
              <Link href={`/e/${slug}/submit`}>
                <Button size="lg" className="h-12 px-8 text-lg font-bold shadow-lg shadow-accent/20">
                  <Plus size={20} className="mr-2" />
                  Submit Project
                </Button>
              </Link>
            ) : !registration ? (
              <Button onClick={handleRegister} variant="secondary" className="h-12">
                Join Event to Submit
              </Button>
            ) : isWaitlisted ? (
              <Badge variant="secondary" className="px-4 py-2">On Waitlist</Badge>
            ) : null}
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-8">
            {/* Themes */}
            {eventThemes.length > 0 && (
              <section className="space-y-4">
                <h2 className="text-2xl font-bold text-white flex items-center gap-2">
                  <Sparkles size={24} className="text-accent" />
                  Available Themes
                </h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {eventThemes.map((theme) => (
                    <Card key={theme.id} className="p-6 border-zinc-800 hover:border-accent/30 transition-all">
                      <div className="text-4xl mb-4">{getThemeEmoji(theme)}</div>
                      <h3 className="text-lg font-bold text-white mb-2">{theme.name}</h3>
                      <p className="text-sm text-zinc-400 leading-relaxed">{theme.concept}</p>
                    </Card>
                  ))}
                </div>
              </section>
            )}

            {/* Judging Criteria */}
            {eventThemes[0]?.judgingCriteria && (
              <Card className="p-8 bg-zinc-950 border-zinc-800">
                <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                  <Trophy size={20} className="text-yellow-500" />
                  Judging Criteria
                </h2>
                <div className="space-y-4">
                  {eventThemes[0].judgingCriteria.map((criterion, idx) => (
                    <div key={idx} className="flex items-start gap-4 p-4 rounded-xl bg-zinc-900/50 border border-zinc-800">
                      <div className="w-8 h-8 rounded-full bg-accent/10 text-accent flex items-center justify-center font-bold shrink-0">
                        {idx + 1}
                      </div>
                      <p className="text-zinc-300 font-medium">{criterion}</p>
                    </div>
                  ))}
                </div>
              </Card>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <Card className="p-6 border-zinc-800">
              <h3 className="font-bold text-white mb-4 flex items-center gap-2">
                <Activity size={18} className="text-blue-400" />
                Live Activity
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center py-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <p className="text-2xl font-black text-white">{event.currentRegistrations || 0}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Participants</p>
                </div>
                <div className="text-center py-4 bg-zinc-900 rounded-xl border border-zinc-800">
                  <p className="text-2xl font-black text-white">{eventTeams.length}</p>
                  <p className="text-[10px] text-zinc-500 uppercase tracking-widest mt-1">Shipped</p>
                </div>
              </div>
              <div className="mt-4 pt-4 border-t border-zinc-800 space-y-3">
                <Link href={`/e/${slug}/gallery`} className="block">
                  <Button variant="secondary" className="w-full">
                    View Live Gallery
                  </Button>
                </Link>
                {registration && (
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    onClick={handleWithdraw}
                    disabled={isRegistering}
                    className="w-full text-zinc-600 hover:text-red-400 transition-colors h-8 text-xs"
                  >
                    <LogOut size={12} className="mr-2" />
                    Withdraw from Event
                  </Button>
                )}
              </div>
            </Card>

            {isAdmin && <EventPhaseController event={event} />}
          </div>
        </div>
      </div>
    );
  }

  // 3. ARCHIVED FLOW
  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div className="text-center space-y-4 pb-8">
        <Badge variant="secondary" className="mb-2">Completed</Badge>
        <h1 className="text-5xl font-black text-white tracking-tight">{event.name}</h1>
        <p className="text-xl text-zinc-400 max-w-2xl mx-auto">
          This event has concluded. Explore the amazing projects built by our community.
        </p>
        <div className="flex items-center justify-center gap-4 pt-4">
          <Link href={`/e/${slug}/gallery`}>
            <Button size="lg" className="h-14 px-8 text-lg font-bold">
              <LayoutGrid size={20} className="mr-2" />
              Project Gallery
            </Button>
          </Link>
          <Link href={`/e/${slug}/leaderboard`}>
            <Button variant="secondary" size="lg" className="h-14 px-8 text-lg font-bold">
              <Trophy size={20} className="mr-2" />
              Final Results
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-8 border-t border-zinc-800 pt-12">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">Event Legacy</h2>
          <p className="text-zinc-400 leading-relaxed">
            {event.description}
          </p>
          <div className="flex gap-8 py-4">
            <div>
              <p className="text-2xl font-bold text-white">{eventTeams.length}</p>
              <p className="text-sm text-zinc-500">Participants</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{new Date(event.startDate).getFullYear()}</p>
              <p className="text-sm text-zinc-500">Year</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{event.location}</p>
              <p className="text-sm text-zinc-500">Venue</p>
            </div>
          </div>
        </div>
        
        {/* Themes Showcase */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold text-white">The Challenge</h2>
          <div className="space-y-2">
            {eventThemes.map(theme => (
              <div key={theme.id} className="flex items-center gap-3 p-3 rounded-lg bg-zinc-900 border border-zinc-800">
                <span className="text-2xl">{getThemeEmoji(theme)}</span>
                <span className="font-semibold text-zinc-300">{theme.name}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {isAdmin && <EventPhaseController event={event} />}
    </div>
  );
}
