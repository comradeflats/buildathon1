'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/context/AuthContext';
import { EventRegistration } from '@/lib/types';

export function useRegistration(eventId?: string) {
  const { user, getFirebaseToken } = useAuth();
  const [registration, setRegistration] = useState<EventRegistration | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRegistering, setIsRegistering] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const checkRegistration = useCallback(async () => {
    if (!user || !eventId) {
      setIsLoading(false);
      return;
    }

    try {
      const token = await getFirebaseToken();
      if (!token) {
        setIsLoading(false);
        return;
      }
      
      const response = await fetch(`/api/events/${eventId}/register`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.registered) {
          setRegistration(data.registration);
        } else {
          setRegistration(null);
        }
      }
    } catch (err) {
      console.error('Error checking registration:', err);
    } finally {
      setIsLoading(false);
    }
  }, [user, eventId, getFirebaseToken]);

  useEffect(() => {
    checkRegistration();
  }, [checkRegistration]);

  const register = async (metadata?: { skillLevel: string; teamIntent: string }) => {
    if (!user || !eventId) return;

    setIsRegistering(true);
    setError(null);

    try {
      const token = await getFirebaseToken();
      if (!token) {
        setIsRegistering(false);
        return;
      }
      
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(metadata || {})
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to register');
      }

      await checkRegistration();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  };

  const withdraw = async () => {
    if (!user || !eventId) return;

    setIsRegistering(true);
    setError(null);

    try {
      const token = await getFirebaseToken();
      if (!token) {
        setIsRegistering(false);
        return;
      }
      
      const response = await fetch(`/api/events/${eventId}/register`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to withdraw');
      }

      await checkRegistration();
      return data;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsRegistering(false);
    }
  };

  return {
    registration,
    isLoading,
    isRegistering,
    error,
    register,
    withdraw,
    refresh: checkRegistration
  };
}
