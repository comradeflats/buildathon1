'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, Building2, Plus, ArrowRight, Settings } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';

export default function DashboardPage() {
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

  // If user has orgs, redirect to first org's dashboard
  useEffect(() => {
    if (!orgsLoading && organizations.length === 1) {
      router.push(`/dashboard/${organizations[0].slug}`);
    }
  }, [organizations, orgsLoading, router]);

  if (isLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  if (organizations.length === 0) {
    return (
      <div className="max-w-2xl mx-auto py-20 text-center">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto mb-6">
          <Building2 className="text-zinc-400" size={32} />
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          No Organizations Yet
        </h1>
        <p className="text-zinc-400 mb-8">
          Create your first organization to start hosting buildathon events
        </p>
        <Link href="/onboarding">
          <Button size="lg">
            <Plus size={20} className="mr-2" />
            Create Organization
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-12">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">
            Your Organizations
          </h1>
          <p className="text-zinc-400">
            Select an organization to manage its events
          </p>
        </div>
        <Link href="/onboarding">
          <Button variant="secondary">
            <Plus size={18} className="mr-2" />
            New Organization
          </Button>
        </Link>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {organizations.map((org) => (
          <Card
            key={org.id}
            className="p-6 hover:border-zinc-600 transition-colors cursor-pointer group"
            onClick={() => router.push(`/dashboard/${org.slug}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                  <Building2 className="text-accent" size={24} />
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-accent transition-colors">
                    {org.name}
                  </h3>
                  <p className="text-sm text-zinc-500">/{org.slug}</p>
                </div>
              </div>
              <ArrowRight size={20} className="text-zinc-600 group-hover:text-accent transition-colors" />
            </div>

            {org.description && (
              <p className="text-sm text-zinc-400 mb-4 line-clamp-2">
                {org.description}
              </p>
            )}

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-zinc-500">
                <span>{org.memberCount} member{org.memberCount !== 1 ? 's' : ''}</span>
              </div>
              <Link
                href={`/dashboard/${org.slug}/settings`}
                onClick={(e) => e.stopPropagation()}
                className="text-zinc-500 hover:text-accent transition-colors"
              >
                <Settings size={18} />
              </Link>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
