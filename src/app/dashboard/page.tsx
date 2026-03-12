'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Building2, Plus, ArrowRight, Settings, LayoutGrid, Calendar, User as UserIcon, Trophy, Zap } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { ParticipantSetupWizard } from '@/components/auth/ParticipantSetupWizard';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useTeams } from '@/hooks/useTeams';
import { useEvents } from '@/hooks/useEvents';

export default function DashboardPage() {
  const router = useRouter();
  const { user, userProfile, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const { teams, isLoading: teamsLoading } = useTeams();
  const { events, isLoading: eventsLoading } = useEvents();

  const [activeTab, setActiveTab] = useState<'overview' | 'events' | 'submissions'>('overview');

  const isLoading = authLoading || orgsLoading || teamsLoading || eventsLoading;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  // If user has orgs, we could redirect, but let's keep them here to see their hacker profile too
  // Or at least allow switching. For now, let's show the dual view if they have orgs.

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
                {userProfile?.displayName || user?.displayName || 'Builder'}
              </h1>
              {userProfile?.profileCompleted && (
                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 py-0.5">
                  Verified Builder
                </Badge>
              )}
            </div>
            <p className="text-zinc-500 font-medium">
              {userProfile?.role ? (userProfile.role.charAt(0).toUpperCase() + userProfile.role.slice(1)) : 'Participant'} • {myTeams.length} Submissions
            </p>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href="/onboarding">
            <Button variant="secondary" className="rounded-full">
              <Building2 size={18} className="mr-2" />
              {organizations.length > 0 ? 'My Organizations' : 'Host an Event'}
            </Button>
          </Link>
          <Link href="/settings">
            <Button variant="ghost" size="icon" className="rounded-full h-11 w-11">
              <Settings size={20} />
            </Button>
          </Link>
        </div>
      </div>

      {/* Setup Wizard for Hackers */}
      <ParticipantSetupWizard 
        userProfile={userProfile} 
        hasSubmissions={myTeams.length > 0} 
      />

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
          className={`px-6 py-2 rounded-full text-sm font-bold transition-all ${
            activeTab === 'submissions' ? 'bg-zinc-800 text-white' : 'text-zinc-500 hover:text-zinc-300'
          }`}
        >
          Submissions
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

            <Card className="p-6 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-zinc-500 text-sm font-bold uppercase tracking-wider">Role</span>
                <UserIcon size={20} className="text-blue-500" />
              </div>
              <div className="text-2xl font-black text-white truncate">
                {userProfile?.role || 'Builder'}
              </div>
            </Card>

            {/* Organizations (if any) */}
            {organizations.length > 0 && (
              <div className="md:col-span-3 space-y-4">
                <h2 className="text-xl font-black text-white">Your Organizations</h2>
                <div className="grid md:grid-cols-2 gap-4">
                  {organizations.map((org) => (
                    <Card
                      key={org.id}
                      className="p-4 hover:border-zinc-600 transition-colors cursor-pointer group"
                      onClick={() => router.push(`/dashboard/${org.slug}`)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-accent/10 rounded-lg flex items-center justify-center">
                            <Building2 className="text-accent" size={20} />
                          </div>
                          <div>
                            <h3 className="font-bold text-white group-hover:text-accent transition-colors">
                              {org.name}
                            </h3>
                            <p className="text-xs text-zinc-500">Manage your events</p>
                          </div>
                        </div>
                        <ArrowRight size={18} className="text-zinc-600 group-hover:text-accent transition-colors" />
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'events' && (
          <div className="space-y-4">
            <h2 className="text-xl font-black text-white">Participating Events</h2>
            {myEvents.length === 0 ? (
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
                {myEvents.map(event => (
                  <Card key={event.id} className="p-4 hover:border-zinc-600 transition-colors">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-800 rounded-xl flex items-center justify-center">
                          <Calendar className="text-accent" size={24} />
                        </div>
                        <div>
                          <h3 className="font-bold text-white">{event.name}</h3>
                          <p className="text-sm text-zinc-500">{new Date(event.startDate).toLocaleDateString()}</p>
                        </div>
                      </div>
                      <Link href={`/events/${event.id}`}>
                        <Button variant="ghost">View Details</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
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
                  <Card key={team.id} className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-bold text-white">{team.projectName}</h3>
                        <p className="text-sm text-zinc-500">{team.name}</p>
                      </div>
                      <Badge>{team.urlType}</Badge>
                    </div>
                    <p className="text-sm text-zinc-400 line-clamp-2">{team.description}</p>
                    <div className="flex items-center gap-2 pt-2">
                      <Link href={`/submit?teamId=${team.id}&eventId=${team.eventId}`} className="flex-1">
                        <Button variant="outline" className="w-full text-xs">Edit</Button>
                      </Link>
                      <Link href={`/events/${team.eventId}`} className="flex-1">
                        <Button variant="ghost" className="w-full text-xs">View in Event</Button>
                      </Link>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
