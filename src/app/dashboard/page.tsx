'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Loader2, Building2, Plus, ArrowRight, Settings, LayoutGrid, Calendar,
  User as UserIcon, Trophy, Zap, AlertCircle, CheckCircle, Lock, Sparkles, Clock, LogOut, X
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ParticipantSetupWizard } from '@/components/auth/ParticipantSetupWizard';
import { VerificationBanner } from '@/components/auth/VerificationBanner';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useTeams } from '@/hooks/useTeams';
import { useEvents } from '@/hooks/useEvents';
import { useUserRegistrations } from '@/hooks/useUserRegistrations';
import { getEventStatus } from '@/lib/utils';
import { WithdrawModal } from '@/components/events/WithdrawModal';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, isLoading: authLoading, getFirebaseToken, migrateGuestData } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const { teams, isLoading: teamsLoading } = useTeams();
  const { events, isLoading: eventsLoading } = useEvents();
  const { registrations, isLoading: regsLoading, refresh: refreshRegistrations } = useUserRegistrations();

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'submissions'>('overview');
  const [withdrawModal, setWithdrawModal] = useState<{
    isOpen: boolean;
    eventId: string;
    eventName: string;
    eventDate: string;
    registrationStatus: 'approved' | 'waitlisted';
  }>({
    isOpen: false,
    eventId: '',
    eventName: '',
    eventDate: '',
    registrationStatus: 'approved'
  });
  const [migrationMessage, setMigrationMessage] = useState<{
    show: boolean;
    summary?: { registrations: number; submissions: number; votes: number };
  }>({ show: false });

  const isLoading = authLoading || orgsLoading || teamsLoading || eventsLoading || regsLoading;
  const isGuest = user?.isAnonymous;

  // Redirect only if not authenticated at all
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  // Attempt guest data migration when user is authenticated and not anonymous
  useEffect(() => {
    if (!user || user.isAnonymous || authLoading) {
      return;
    }

    // Check if there's a pending migration
    const guestUid = localStorage.getItem('guestUidForMigration');
    if (!guestUid) {
      return;
    }

    // Trigger migration
    console.log('[DASHBOARD] Triggering guest data migration...');
    migrateGuestData().then((result) => {
      if (result.success && result.summary) {
        const total =
          (result.summary.registrations || 0) +
          (result.summary.submissions || 0) +
          (result.summary.votes || 0);

        if (total > 0) {
          setMigrationMessage({ show: true, summary: result.summary });
          refreshRegistrations(); // Refresh to show migrated registrations
        }
      }
    });
  }, [user, authLoading, migrateGuestData, refreshRegistrations]);

  const openWithdrawModal = (
    eventId: string,
    eventName: string,
    eventDate: string,
    status: 'approved' | 'waitlisted'
  ) => {
    setWithdrawModal({
      isOpen: true,
      eventId,
      eventName,
      eventDate,
      registrationStatus: status
    });
  };

  const closeWithdrawModal = () => {
    setWithdrawModal(prev => ({ ...prev, isOpen: false }));
  };

  const handleWithdraw = async () => {
    const token = await getFirebaseToken();
    if (!token) {
      throw new Error('Authentication required');
    }

    const response = await fetch(`/api/events/${withdrawModal.eventId}/register`, {
      method: 'DELETE',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || 'Failed to withdraw');
    }

    // Refresh registrations list
    await refreshRegistrations();
  };

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  // Filter teams owned by the user
  const myTeams = teams.filter(t => t.ownerId === user?.uid);
  const myEvents = events.filter(e => myTeams.some(t => t.eventId === e.id));

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      {/* Guest Warning Banner */}
      {isGuest && (
        <div className="bg-amber-500/10 border border-amber-500/20 rounded-2xl p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/20 rounded-lg text-amber-500">
              <AlertCircle size={20} />
            </div>
            <div>
              <p className="text-sm font-bold text-white">Temporary Session</p>
              <p className="text-xs text-zinc-400">Your progress is saved to your browser. Create an account to sync across devices.</p>
            </div>
          </div>
          <Link href="/signup">
            <Button size="sm" className="bg-amber-500 hover:bg-amber-600 text-zinc-950 font-bold">
              Save My Progress
            </Button>
          </Link>
        </div>
      )}

      {/* Email Verification Banner */}
      <VerificationBanner />

      {/* Migration Success Banner */}
      {migrationMessage.show && migrationMessage.summary && (
        <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-4 flex items-start justify-between gap-4">
          <div className="flex items-start gap-3 flex-1">
            <div className="p-2 bg-emerald-500/20 rounded-lg text-emerald-500 shrink-0">
              <CheckCircle size={20} />
            </div>
            <div className="flex-1">
              <p className="text-sm font-bold text-white mb-1">Welcome! Your data has been migrated</p>
              <p className="text-xs text-zinc-400 leading-relaxed">
                {migrationMessage.summary.registrations > 0 && `${migrationMessage.summary.registrations} registration${migrationMessage.summary.registrations === 1 ? '' : 's'}`}
                {migrationMessage.summary.registrations > 0 && migrationMessage.summary.submissions > 0 && ', '}
                {migrationMessage.summary.submissions > 0 && `${migrationMessage.summary.submissions} submission${migrationMessage.summary.submissions === 1 ? '' : 's'}`}
                {(migrationMessage.summary.registrations > 0 || migrationMessage.summary.submissions > 0) && migrationMessage.summary.votes > 0 && ', and '}
                {migrationMessage.summary.votes > 0 && `${migrationMessage.summary.votes} vote${migrationMessage.summary.votes === 1 ? '' : 's'}`}
                {' '}have been linked to your new account.
              </p>
            </div>
          </div>
          <button
            onClick={() => setMigrationMessage({ show: false })}
            className="p-1 text-zinc-500 hover:text-white transition-colors shrink-0"
          >
            <X size={16} />
          </button>
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-20 h-20 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-3xl flex items-center justify-center text-zinc-950 shadow-lg shadow-emerald-500/20">
            {userProfile?.photoUrl ? (
              <img src={userProfile.photoUrl} alt="" className="w-full h-full rounded-3xl object-cover" />
            ) : (
              <UserIcon size={40} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-black text-white">
                {isGuest ? 'Guest Builder' : (userProfile?.displayName || user?.displayName || 'Builder')}
              </h1>
              {isGuest ? (
                <Badge variant="secondary" className="bg-zinc-800 text-zinc-400 border-zinc-700 py-0.5">
                  Guest Mode
                </Badge>
              ) : userProfile?.profileCompleted && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 py-0.5">
                  Verified Builder
                </Badge>
              )}
            </div>
            <p className="text-zinc-500 font-medium">
              {isGuest ? 'Limited Access' : (userProfile?.role ? (userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)) : 'Participant')} • {myTeams.length} Submissions
            </p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          {isGuest ? (
            <Link href="/signup">
              <Button variant="secondary" className="rounded-xl h-11 px-6 border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400">
                <Sparkles size={18} className="mr-2" />
                Unlock Hosting
              </Button>
            </Link>
          ) : (
            <Link href="/dashboard/my-organizations">
              <Button variant="secondary" className="rounded-xl h-11 px-6 border-zinc-700 bg-zinc-800/50 hover:bg-zinc-800 text-zinc-300">
                <Building2 size={18} className="mr-2" />
                {organizations.length > 0 ? 'Manage Organizations' : 'Host an Event'}
              </Button>
            </Link>
          )}
          <Link href={isGuest ? "/signup" : "/settings"}>
            <Button variant="ghost" className="rounded-xl h-11 px-6 border border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all">
              <Settings size={18} className="mr-2" />
              {isGuest ? "Account Settings" : "Profile Settings"}
            </Button>
          </Link>
        </div>
      </div>

      {/* Setup Wizard for Hackers - Only show for real users or if guest has activity */}
      {!isGuest && (
        <ParticipantSetupWizard 
          userProfile={userProfile} 
          hasSubmissions={myTeams.length > 0} 
        />
      )}

      {/* Tabs */}
      <div className="flex items-center gap-1 bg-zinc-900/50 p-1 rounded-full border border-zinc-800 w-fit">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === 'overview' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Overview
        </button>
        <button
          onClick={() => setActiveTab('events')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === 'events' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          My Events
        </button>
        <button
          onClick={() => setActiveTab('submissions')}
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all flex items-center gap-2 ${
            activeTab === 'submissions' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Submissions
          {isGuest && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
        </button>
      </div>

      {/* Tab Content */}
      <div className="space-y-8">
        {activeTab === 'overview' && (
          <div className="grid md:grid-cols-3 gap-6">
            {/* Stats */}
            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Submissions</span>
                <Trophy size={20} className="text-emerald-500" />
              </div>
              <div className="text-4xl font-black text-white">{myTeams.length}</div>
            </Card>

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Events</span>
                <Zap size={20} className="text-amber-500" />
              </div>
              <div className="text-4xl font-black text-white">{myEvents.length}</div>
            </Card>

            <Card className="p-6 space-y-2 relative overflow-hidden group">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Role</span>
                <UserIcon size={20} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-white truncate">
                {isGuest ? 'Guest Builder' : (userProfile?.role || 'Builder')}
              </div>
              {isGuest && (
                <Link href="/signup" className="absolute inset-0 bg-zinc-900/80 backdrop-blur-sm flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                   <p className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
                     <Lock size={12} /> Unlock Profile
                   </p>
                </Link>
              )}
            </Card>
            
            {/* Guest Welcome / Onboarding Checklist */}
            {isGuest && myEvents.length === 0 && (
              <Card className="md:col-span-3 p-8 border-emerald-500/20 bg-emerald-500/5">
                <div className="flex flex-col md:flex-row gap-8 items-center">
                  <div className="flex-1 space-y-4">
                    <h2 className="text-2xl font-black text-white">Welcome to the Arena!</h2>
                    <p className="text-zinc-400 font-medium leading-relaxed">
                      You're currently exploring as a guest. Your local activity will be tracked, but creating an account unlocks the full experience.
                    </p>
                    <div className="grid sm:grid-cols-2 gap-4">
                      {[
                        { label: 'Explore live arenas', done: true },
                        { label: 'Join your first event', done: false },
                        { label: 'Submit a project', done: false },
                        { label: 'Permanent builder profile', done: false }
                      ].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-3">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center border ${item.done ? 'bg-emerald-500 border-emerald-500 text-zinc-950' : 'border-zinc-700 text-transparent'}`}>
                            <CheckCircle size={12} />
                          </div>
                          <span className={`text-sm font-bold ${item.done ? 'text-white' : 'text-zinc-600'}`}>{item.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="shrink-0 space-y-3 w-full md:w-64">
                    <Link href="/signup">
                      <Button className="w-full h-12 bg-white text-zinc-950 hover:bg-zinc-200 font-black">
                        CREATE FULL ACCOUNT
                      </Button>
                    </Link>
                    <Link href="/events">
                      <Button variant="ghost" className="w-full text-zinc-400 hover:text-white">
                        Browse Arenas <ArrowRight size={16} className="ml-2" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </Card>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">My Registrations</h2>
            {registrations.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                  <Calendar size={32} className="text-zinc-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No events joined yet</h3>
                  <p className="text-zinc-500">Find an upcoming buildathon and get building!</p>
                </div>
                <Link href="/events">
                  <Button>Browse Events</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid gap-4">
                {registrations.map(reg => {
                  const event = reg.event;
                  if (!event) return null;

                  const eventStatus = getEventStatus(event.startDate, event.endDate);
                  const isApproved = reg.status === 'approved';
                  const isWaitlisted = reg.status === 'waitlisted';

                  return (
                    <Card key={reg.id} className="p-5 hover:border-zinc-600 transition-colors">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex items-start gap-4 flex-1 min-w-0">
                          <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center shrink-0">
                            <Calendar className="text-accent" size={24} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3 className="font-bold text-white truncate">{event.name}</h3>
                              <Badge variant="outline" className={`text-[9px] px-1.5 py-0.5 shrink-0 ${
                                eventStatus === 'active'
                                  ? 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5'
                                  : eventStatus === 'upcoming'
                                    ? 'border-violet-500/30 text-violet-400 bg-violet-500/5'
                                    : 'border-zinc-700 text-zinc-500'
                              }`}>
                                {eventStatus.toUpperCase()}
                              </Badge>
                            </div>
                            <p className="text-sm text-zinc-500 mb-3">
                              {new Date(event.startDate).toLocaleDateString()}
                            </p>

                            {/* Registration Status */}
                            <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
                              isApproved
                                ? 'bg-emerald-500/5 border-emerald-500/20'
                                : isWaitlisted
                                  ? 'bg-yellow-500/5 border-yellow-500/20'
                                  : 'bg-zinc-800 border-zinc-700'
                            }`}>
                              <div className={`p-1 rounded ${
                                isApproved
                                  ? 'bg-emerald-500/10 text-emerald-500'
                                  : isWaitlisted
                                    ? 'bg-yellow-500/10 text-yellow-500'
                                    : 'bg-zinc-700 text-zinc-400'
                              }`}>
                                {isApproved ? (
                                  <CheckCircle size={14} />
                                ) : isWaitlisted ? (
                                  <Clock size={14} />
                                ) : (
                                  <AlertCircle size={14} />
                                )}
                              </div>
                              <div>
                                <p className={`text-xs font-bold ${
                                  isApproved
                                    ? 'text-emerald-400'
                                    : isWaitlisted
                                      ? 'text-yellow-400'
                                      : 'text-zinc-400'
                                }`}>
                                  {isApproved ? 'Registered' : isWaitlisted ? 'Waitlisted' : reg.status}
                                </p>
                                {isWaitlisted && reg.waitlistPosition && (
                                  <p className="text-[10px] text-zinc-500">
                                    Position #{reg.waitlistPosition}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-col gap-2 shrink-0">
                          <Link href={`/e/${event.slug || event.id}`}>
                            <Button variant="secondary" size="sm" className="h-9 px-4">
                              View Event
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => openWithdrawModal(
                              event.id,
                              event.name,
                              new Date(event.startDate).toLocaleDateString(),
                              reg.status as 'approved' | 'waitlisted'
                            )}
                            className="h-9 px-4 text-zinc-500 hover:text-red-400 hover:bg-red-500/5 border border-transparent hover:border-red-500/20"
                          >
                            <LogOut size={14} className="mr-1.5" />
                            Withdraw
                          </Button>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {activeTab === 'submissions' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-black text-white">Your Submissions</h2>
              <Link href="/submit">
                <Button size="sm">New Submission</Button>
              </Link>
            </div>
            
            {isGuest && (
              <div className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={18} />
                <p className="text-xs text-amber-500/80 font-medium italic">
                  Note: As a guest, your submissions are linked to your browser. 
                  <Link href="/signup" className="underline font-bold ml-1 hover:text-amber-400">Create an account</Link> to secure your builder legacy.
                </p>
              </div>
            )}

            {myTeams.length === 0 ? (
              <Card className="p-12 text-center space-y-4">
                <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto">
                  <Trophy size={32} className="text-zinc-600" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">No submissions yet</h3>
                  <p className="text-zinc-500">Ready to share your work? Start your first project.</p>
                </div>
                <Link href="/submit">
                  <Button>Submit Project</Button>
                </Link>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 gap-4">
                {myTeams.map(team => (
                  <Card key={team.id} className="p-6 space-y-4 hover:border-emerald-500/30 transition-all">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white group-hover:text-emerald-400 transition-colors">{team.projectName}</h3>
                        <p className="text-sm text-zinc-500">{team.name}</p>
                      </div>
                      <Badge variant="outline" className="border-zinc-700 text-zinc-500 uppercase text-[10px]">{team.urlType}</Badge>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2 leading-relaxed">{team.description}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/submit?teamId=${team.id}&eventId=${team.eventId}`} className="flex-1">
                        <Button variant="secondary" className="w-full text-xs font-bold h-9">
                          Edit Submission
                        </Button>
                      </Link>
                      <Link href={`/events/${team.eventId}`} className="flex-1">
                        <Button variant="ghost" className="w-full text-xs font-bold h-9 hover:bg-zinc-800">
                          View in Arena
                        </Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Withdraw Modal */}
      <WithdrawModal
        isOpen={withdrawModal.isOpen}
        onClose={closeWithdrawModal}
        onConfirm={handleWithdraw}
        eventName={withdrawModal.eventName}
        eventDate={withdrawModal.eventDate}
        registrationStatus={withdrawModal.registrationStatus}
      />
    </div>
  );
}
