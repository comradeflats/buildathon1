'use client';

import { useEffect, useState, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Loader2, Users, ArrowLeft, Search, Filter, 
  CheckCircle, Clock, XCircle, Trash2, Mail,
  UserCheck, UserX, UserPlus, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { useAuth } from '@/context/AuthContext';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';
import { EventRegistration, RegistrationStatus, Event } from '@/lib/types';

export default function ParticipantsPage() {
  const params = useParams();
  const router = useRouter();
  const orgSlug = params.orgSlug as string;
  const eventId = params.eventId as string;

  const { user, getFirebaseToken } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const [org, setOrg] = useState<any>(null);
  const [event, setEvent] = useState<Event | null>(null);
  const [participants, setParticipants] = useState<EventRegistration[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isActionLoading, setIsActionLoading] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Find organization
  useEffect(() => {
    if (!orgsLoading && organizations.length > 0) {
      const foundOrg = organizations.find((o) => o.slug === orgSlug);
      if (foundOrg) {
        setOrg(foundOrg);
      } else {
        router.push('/dashboard');
      }
    }
  }, [organizations, orgsLoading, orgSlug, router]);

  const { permissions } = useOrgPermissions(org?.id);

  const fetchEventAndParticipants = useCallback(async () => {
    if (!org?.id || !user) return;

    try {
      const token = await getFirebaseToken();
      
      // Fetch Event
      const eventRes = await fetch(`/api/events/${eventId}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (eventRes.ok) {
        const data = await eventRes.json();
        setEvent(data.event);
      }

      // Fetch Participants
      const partRes = await fetch(`/api/events/${eventId}/participants`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (partRes.ok) {
        const data = await partRes.json();
        setParticipants(data.participants);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [org?.id, eventId, user, getFirebaseToken]);

  useEffect(() => {
    fetchEventAndParticipants();
  }, [fetchEventAndParticipants]);

  const handleUpdateStatus = async (userId: string, status: RegistrationStatus) => {
    setIsActionLoading(userId);
    try {
      const token = await getFirebaseToken();
      const response = await fetch(`/api/events/${eventId}/participants`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ userId, status })
      });

      if (response.ok) {
        await fetchEventAndParticipants();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
    } finally {
      setIsActionLoading(null);
    }
  };

  const handleRemoveParticipant = async (userId: string) => {
    if (!confirm('Are you sure you want to remove this participant?')) return;
    
    setIsActionLoading(userId);
    try {
      const token = await getFirebaseToken();
      const response = await fetch(`/api/events/${eventId}/participants?userId=${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });

      if (response.ok) {
        await fetchEventAndParticipants();
      }
    } catch (err) {
      console.error('Failed to remove participant:', err);
    } finally {
      setIsActionLoading(null);
    }
  };

  const filteredParticipants = participants.filter(p => {
    const matchesStatus = statusFilter === 'all' || p.status === statusFilter;
    const matchesSearch = p.displayName.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          p.email.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  if (isLoading || orgsLoading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-zinc-400" />
      </div>
    );
  }

  const approvedCount = participants.filter(p => p.status === 'approved').length;
  const waitlistCount = participants.filter(p => p.status === 'waitlisted').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-sm text-zinc-500 mb-2">
          <Link href={`/dashboard/${orgSlug}/events`} className="hover:text-white transition-colors">
            Events
          </Link>
          <span>/</span>
          <span className="text-white">{event?.name || 'Loading...'}</span>
          <span>/</span>
          <span className="text-white">Participants</span>
        </div>
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Manage Participants</h1>
            <p className="text-zinc-400">
              Approve, waitlist, or remove registrants for your event.
            </p>
          </div>
          <div className="flex gap-4">
            <Card className="px-4 py-2 bg-emerald-500/10 border-emerald-500/20">
              <p className="text-xs text-emerald-500 uppercase font-bold tracking-wider">Approved</p>
              <p className="text-xl font-black text-white">{approvedCount} / {event?.maxParticipants || '∞'}</p>
            </Card>
            <Card className="px-4 py-2 bg-yellow-500/10 border-yellow-500/20">
              <p className="text-xs text-yellow-500 uppercase font-bold tracking-wider">Waitlist</p>
              <p className="text-xl font-black text-white">{waitlistCount}</p>
            </Card>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-zinc-900 border border-zinc-800 rounded-lg py-2 pl-10 pr-4 text-white focus:outline-none focus:border-accent"
          />
        </div>
        <div className="flex items-center bg-zinc-900 p-1 rounded-lg border border-zinc-800">
          {['all', 'approved', 'waitlisted', 'pending'].map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium capitalize transition-all ${
                statusFilter === s ? 'bg-accent text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              {s}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <Card className="overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-zinc-900/50 border-b border-zinc-800">
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Participant</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Status</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest">Registered At</th>
              <th className="px-6 py-4 text-xs font-bold text-zinc-500 uppercase tracking-widest text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-800">
            {filteredParticipants.length === 0 ? (
              <tr>
                <td colSpan={4} className="px-6 py-12 text-center text-zinc-500">
                  <Users size={32} className="mx-auto mb-2 opacity-20" />
                  No participants found
                </td>
              </tr>
            ) : (
              filteredParticipants.map((p) => (
                <tr key={p.id} className="hover:bg-zinc-900/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center text-zinc-400 font-bold">
                        {p.displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold text-white">{p.displayName}</p>
                        <p className="text-sm text-zinc-500">{p.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <Badge variant={p.status === 'approved' ? 'success' : p.status === 'waitlisted' ? 'default' : 'secondary'}>
                      {p.status === 'approved' && <CheckCircle size={12} className="mr-1" />}
                      {p.status === 'waitlisted' && <Clock size={12} className="mr-1" />}
                      {p.status}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 text-sm text-zinc-500">
                    {new Date(p.registeredAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      {p.status !== 'approved' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleUpdateStatus(p.userId, 'approved')}
                          disabled={!!isActionLoading}
                          className="text-emerald-500 hover:text-emerald-400 hover:bg-emerald-500/10"
                        >
                          <UserCheck size={18} />
                        </Button>
                      )}
                      {p.status !== 'waitlisted' && (
                        <Button 
                          size="sm" 
                          variant="ghost" 
                          onClick={() => handleUpdateStatus(p.userId, 'waitlisted')}
                          disabled={!!isActionLoading}
                          className="text-yellow-500 hover:text-yellow-400 hover:bg-yellow-500/10"
                        >
                          <Clock size={18} />
                        </Button>
                      )}
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        onClick={() => handleRemoveParticipant(p.userId)}
                        disabled={!!isActionLoading}
                        className="text-red-500 hover:text-red-400 hover:bg-red-500/10"
                      >
                        <Trash2 size={18} />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </Card>

      {/* Capacity Warning */}
      {event && event.maxParticipants && approvedCount >= event.maxParticipants && (
        <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl flex items-center gap-3">
          <AlertCircle className="text-yellow-500" size={20} />
          <p className="text-sm text-yellow-500 font-medium">
            Event has reached maximum capacity ({event.maxParticipants}). New registrants will be added to the waitlist automatically.
          </p>
        </div>
      )}
    </div>
  );
}
