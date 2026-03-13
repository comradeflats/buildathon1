'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, 
  Calendar, 
  Users, 
  BarChart3, 
  Plus, 
  ArrowRight, 
  Activity, 
  Settings,
  ChevronRight,
  Trophy,
  Zap,
  Globe,
  Building2
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SetupWizard } from '@/components/admin/SetupWizard';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgEvents } from '@/hooks/useOrgEvents';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';

export default function OrgDashboardPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.orgSlug as string;

  const { user, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const [org, setOrg] = useState<any>(null);

  // Find organization by slug
  useEffect(() => {
    if (!orgsLoading && organizations.length > 0) {
      const foundOrg = organizations.find((o) => o.slug === slug);
      if (foundOrg) {
        setOrg(foundOrg);
      } else {
        router.push('/dashboard');
      }
    }
  }, [organizations, orgsLoading, slug, router]);

  const { events, isLoading: eventsLoading } = useOrgEvents(org?.id);
  const { permissions } = useOrgPermissions(org?.id);

  const isLoading = authLoading || orgsLoading || !org;

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  const activeEvent = events.find((e) => e.status === 'active');
  const hasThemes = events.some((e) => e.themesGenerated);
  const totalEvents = events.length;
  const totalApproved = events.reduce((acc, e) => acc + (e.currentRegistrations || 0), 0);

  return (
    <div className="max-w-5xl mx-auto py-8 px-4 space-y-10">
      {/* Enhanced Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-5">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-zinc-950 shadow-xl shadow-emerald-500/10">
            {org.logoUrl ? (
              <img src={org.logoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
            ) : (
              <Building2 size={32} />
            )}
          </div>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-3xl font-black text-white">{org.name}</h1>
              <Badge className="bg-zinc-800 text-zinc-400 border-zinc-700">Organization</Badge>
            </div>
            <div className="flex items-center gap-3 mt-1">
              {org.websiteUrl && (
                <a href={org.websiteUrl} target="_blank" className="text-sm text-zinc-500 hover:text-emerald-400 transition-colors flex items-center gap-1">
                  <Globe size={14} />
                  {new URL(org.websiteUrl).hostname}
                </a>
              )}
              <span className="text-zinc-700">•</span>
              <p className="text-sm text-zinc-500 font-medium">{org.memberCount} Team Members</p>
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <Link href={`/dashboard/${slug}/settings`}>
            <Button variant="secondary" className="rounded-xl h-12">
              <Settings size={18} className="mr-2" />
              Settings
            </Button>
          </Link>
          {permissions.canManageEvents && (
            <Link href={`/dashboard/${slug}/events/new`}>
              <Button className="rounded-xl h-12 px-6 shadow-lg shadow-emerald-500/20">
                <Plus size={18} className="mr-2" />
                New Event
              </Button>
            </Link>
          )}
        </div>
      </div>

      {/* Hero Section: Active Event with High Prominence */}
      {activeEvent ? (
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500 to-cyan-500 rounded-[2rem] blur opacity-25 group-hover:opacity-40 transition duration-1000"></div>
          <Card className="relative p-8 border-emerald-500/30 bg-zinc-900/90 backdrop-blur-xl overflow-hidden rounded-[2rem]">
            <div className="absolute top-0 right-0 p-8">
              <div className="flex items-center gap-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                <span className="text-[10px] font-black text-emerald-500 uppercase tracking-widest">Live Now</span>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              <div className="space-y-6">
                <div className="space-y-2">
                  <h2 className="text-sm font-black text-emerald-500 uppercase tracking-[0.2em]">Active Event</h2>
                  <h3 className="text-4xl font-black text-white leading-tight">{activeEvent.name}</h3>
                </div>
                
                <div className="flex gap-8">
                  <div>
                    <p className="text-3xl font-black text-white">{activeEvent.currentRegistrations || 0}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Participants</p>
                  </div>
                  <div className="w-px h-12 bg-zinc-800" />
                  <div>
                    <p className="text-3xl font-black text-white capitalize">{activeEvent.phase.replace('_', ' ')}</p>
                    <p className="text-[10px] text-zinc-500 font-black uppercase tracking-widest">Current Phase</p>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <Link href={`/dashboard/${slug}/events/${activeEvent.id}/participants`}>
                    <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-6 py-6 rounded-2xl flex items-center gap-2">
                      <Users size={20} />
                      Manage Participants
                    </Button>
                  </Link>
                  <Link href={`/dashboard/${slug}/events/${activeEvent.id}`}>
                    <Button variant="secondary" className="px-6 py-6 rounded-2xl border-zinc-700">
                      Event Console
                    </Button>
                  </Link>
                </div>
              </div>

              <div className="hidden md:block">
                <div className="bg-zinc-950/50 border border-zinc-800 rounded-3xl p-6 space-y-4">
                  <h4 className="text-xs font-black text-zinc-500 uppercase tracking-widest">Phase Control</h4>
                  <div className="space-y-2">
                    {['registration', 'building', 'review', 'judging'].map((p) => (
                      <div key={p} className={`flex items-center justify-between p-3 rounded-xl border ${
                        activeEvent.phase === p ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-zinc-900/50 border-zinc-800 text-zinc-600'
                      }`}>
                        <span className="text-xs font-bold capitalize">{p}</span>
                        {activeEvent.phase === p && <Activity size={14} />}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : (
        <SetupWizard 
          orgSlug={slug}
          hasEvents={events.length > 0}
          hasThemes={hasThemes}
          hasMembers={org.memberCount > 1}
        />
      )}

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-3">
        {[
          { label: 'Total Events', value: totalEvents, icon: Calendar, color: 'text-blue-400', bg: 'bg-blue-400/10' },
          { label: 'Approved Builders', value: totalApproved, icon: Trophy, color: 'text-amber-400', bg: 'bg-amber-400/10' },
          { label: 'Org Capacity', value: 'Pro', icon: Zap, color: 'text-purple-400', bg: 'bg-purple-400/10' },
        ].map((stat, i) => (
          <Card key={i} className="p-6 border-zinc-800 bg-zinc-900/30 backdrop-blur-sm group hover:border-zinc-700 transition-colors">
            <div className="flex items-center justify-between mb-4">
              <div className={`w-10 h-10 ${stat.bg} ${stat.color} rounded-xl flex items-center justify-center`}>
                <stat.icon size={20} />
              </div>
              <ArrowRight size={16} className="text-zinc-700 group-hover:text-zinc-500 transition-colors" />
            </div>
            <div className="text-3xl font-black text-white mb-1">{stat.value}</div>
            <div className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">{stat.label}</div>
          </Card>
        ))}
      </div>

      {/* Recent Events List */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-black text-white">Recent Events</h2>
          <Link href={`/dashboard/${slug}/events`} className="text-emerald-400 hover:text-emerald-300 text-sm font-bold flex items-center gap-1">
            View All Events
            <ChevronRight size={16} />
          </Link>
        </div>

        {eventsLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 size={32} className="animate-spin text-zinc-700" />
          </div>
        ) : events.length === 0 ? (
          <Card className="p-16 text-center border-dashed border-zinc-800 bg-transparent">
            <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
              <Calendar size={40} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Ready to host?</h3>
            <p className="text-zinc-500 mb-8 max-w-xs mx-auto">
              Create your first event to start accepting registrations and building your community.
            </p>
            {permissions.canManageEvents && (
              <Link href={`/dashboard/${slug}/events/new`}>
                <Button className="px-8 h-12 rounded-xl">
                  Create First Event
                </Button>
              </Link>
            )}
          </Card>
        ) : (
          <div className="grid gap-4">
            {events.slice(0, 5).map((event) => (
              <Card
                key={event.id}
                className="p-5 hover:border-zinc-700 transition-all cursor-pointer group bg-zinc-900/20"
                onClick={() => router.push(`/dashboard/${slug}/events/${event.id}`)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-5">
                    <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${
                      event.status === 'active' ? 'bg-emerald-500/10 text-emerald-500' : 'bg-zinc-800 text-zinc-500'
                    }`}>
                      <Calendar size={24} />
                    </div>
                    <div>
                      <h3 className="font-bold text-white group-hover:text-emerald-400 transition-colors">
                        {event.name}
                      </h3>
                      <div className="flex items-center gap-3 mt-1">
                        <Badge variant={event.status === 'active' ? 'success' : 'default'} className="text-[10px] px-2 py-0">
                          {event.status}
                        </Badge>
                        <span className="text-[10px] text-zinc-600 font-bold uppercase tracking-wider">
                          {new Date(event.startDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block">
                      <p className="text-sm font-bold text-white">{event.currentRegistrations || 0}</p>
                      <p className="text-[10px] text-zinc-500 font-bold uppercase">Registrations</p>
                    </div>
                    <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-zinc-700 transition-all">
                      <ChevronRight size={20} />
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
