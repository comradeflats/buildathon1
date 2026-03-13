'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Building2, 
  Plus, 
  ArrowRight, 
  Loader2, 
  ArrowLeft,
  Users,
  Calendar,
  Settings
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';

export default function MyOrganizationsPage() {
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();

  const isLoading = authLoading || orgsLoading;

  // Redirect if not authenticated
  useEffect(() => {
    if (!authLoading && (!user || user.isAnonymous)) {
      router.push('/signup');
    }
  }, [user, authLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto py-12 px-4 space-y-8">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
        <div>
          <Link
            href="/dashboard"
            className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-4 text-sm font-medium"
          >
            <ArrowLeft size={16} />
            Back to Profile
          </Link>
          <h1 className="text-4xl font-black text-white mb-2">My Organizations</h1>
          <p className="text-zinc-400 font-medium">
            Manage your ecosystems, events, and judging teams.
          </p>
        </div>
        <Link href="/onboarding">
          <Button className="rounded-xl h-12 px-6 shadow-lg shadow-emerald-500/20">
            <Plus size={18} className="mr-2" />
            New Organization
          </Button>
        </Link>
      </div>

      {organizations.length === 0 ? (
        <Card className="p-16 text-center border-dashed border-zinc-800 bg-transparent rounded-[2rem]">
          <div className="w-20 h-20 bg-zinc-900 rounded-3xl flex items-center justify-center mx-auto mb-6 text-zinc-700">
            <Building2 size={40} />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No organizations found</h3>
          <p className="text-zinc-500 mb-8 max-w-xs mx-auto">
            You don't belong to any organizations yet. Create one to start hosting events.
          </p>
          <Link href="/onboarding">
            <Button className="px-8 h-12 rounded-xl">
              Create Organization
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {organizations.map((org) => (
            <Card
              key={org.id}
              className="p-6 hover:border-zinc-700 transition-all cursor-pointer group bg-zinc-900/20 rounded-[2rem] border-zinc-800"
              onClick={() => router.push(`/dashboard/${org.slug}`)}
            >
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-2xl flex items-center justify-center text-zinc-950 shadow-lg group-hover:scale-105 transition-transform">
                    {org.logoUrl ? (
                      <img src={org.logoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                    ) : (
                      <Building2 size={24} />
                    )}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-white group-hover:text-emerald-400 transition-colors">
                      {org.name}
                    </h3>
                    <p className="text-xs text-zinc-500 font-bold uppercase tracking-widest mt-0.5">
                      {org.slug}
                    </p>
                  </div>
                </div>
                <div className="w-10 h-10 rounded-xl bg-zinc-800 flex items-center justify-center text-zinc-500 group-hover:text-white group-hover:bg-zinc-700 transition-all">
                  <ArrowRight size={20} />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Users size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Members</span>
                  </div>
                  <p className="text-lg font-black text-white">{org.memberCount || 1}</p>
                </div>
                <div className="bg-zinc-900/50 p-3 rounded-xl border border-zinc-800/50">
                  <div className="flex items-center gap-2 text-zinc-500 mb-1">
                    <Calendar size={14} />
                    <span className="text-[10px] font-black uppercase tracking-widest">Events</span>
                  </div>
                  <p className="text-lg font-black text-white">Manage</p>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-zinc-800/50 flex items-center justify-between">
                <Link 
                  href={`/dashboard/${org.slug}/settings`}
                  onClick={(e) => e.stopPropagation()}
                  className="text-xs font-bold text-zinc-500 hover:text-white flex items-center gap-2 transition-colors"
                >
                  <Settings size={14} />
                  Org Settings
                </Link>
                <Badge className="bg-emerald-500/10 text-emerald-500 border-emerald-500/20">
                  Active
                </Badge>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
