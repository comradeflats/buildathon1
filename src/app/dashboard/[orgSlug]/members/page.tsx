'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { Loader2, ArrowLeft, Users as UsersIcon } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';

export default function OrgMembersPage() {
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

  const { permissions } = useOrgPermissions(org?.id);

  const isLoading = authLoading || orgsLoading || !org;

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
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <Link
          href={`/dashboard/${slug}`}
          className="inline-flex items-center gap-2 text-zinc-400 hover:text-white transition-colors mb-4"
        >
          <ArrowLeft size={16} />
          Back to Dashboard
        </Link>
        <h1 className="text-3xl font-bold text-white mb-2">Team Members</h1>
        <p className="text-zinc-400">
          Manage {org.name} team members and permissions
        </p>
      </div>

      {/* Coming Soon */}
      <Card className="p-12 text-center">
        <UsersIcon size={48} className="mx-auto text-zinc-600 mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Member Management Coming Soon</h3>
        <p className="text-zinc-400">
          Invite team members and manage permissions in a future update
        </p>
      </Card>
    </div>
  );
}
