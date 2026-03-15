'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';

export interface UserRegistrationWithEvent {
  id: string;
  eventId: string;
  userId: string;
  email: string;
  displayName: string;
  status: 'pending' | 'approved' | 'waitlisted' | 'rejected' | 'withdrawn';
  registeredAt: string;
  updatedAt: string;
  organizationId: string;
  metadata?: any;
  waitlistPosition?: number | null;
  event?: any;
}

export function useUserRegistrations() {
  const { user, getFirebaseToken } = useAuth();
  const [registrations, setRegistrations] = useState<UserRegistrationWithEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchRegistrations = useCallback(async () => {
    if (!user) {
      setRegistrations([]);
      setIsLoading(false);
      return;
    }

    try {
      setIsLoading(true);
      const token = await getFirebaseToken();
      if (!token) {
        setIsLoading(false);
        return;
      }

      const response = await fetch('/api/user/registrations', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setRegistrations(data.registrations || []);
      } else {
        throw new Error('Failed to fetch registrations');
      }
    } catch (err: any) {
      console.error('Error fetching registrations:', err);
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }, [user, getFirebaseToken]);

  useEffect(() => {
    fetchRegistrations();
  }, [fetchRegistrations]);

  return {
    registrations,
    isLoading,
    error,
    refresh: fetchRegistrations
  };
}
