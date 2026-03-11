'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';

/**
 * Hook to fetch events for a specific organization
 */
export function useOrgEvents(orgId: string | null) {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !orgId) {
      setIsLoading(false);
      setEvents([]);
      return;
    }

    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('organizationId', '==', orgId),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const eventsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Event[];

        setEvents(eventsData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching org events:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  const getEventsByStatus = useCallback(
    (status: Event['status']): Event[] => {
      return events.filter((event) => event.status === status);
    },
    [events]
  );

  const getActiveEvents = useCallback((): Event[] => {
    return events.filter((event) => event.status === 'active');
  }, [events]);

  const getUpcomingEvents = useCallback((): Event[] => {
    return events.filter((event) => event.status === 'upcoming');
  }, [events]);

  const getArchivedEvents = useCallback((): Event[] => {
    return events.filter((event) => event.status === 'archived');
  }, [events]);

  return {
    events,
    isLoading,
    error,
    getEventsByStatus,
    getActiveEvents,
    getUpcomingEvents,
    getArchivedEvents,
  };
}

/**
 * Hook to create, update, and delete events for an organization
 */
export function useOrgEventManagement(orgId: string | null) {
  const { user } = useAuth();

  const createEvent = useCallback(
    async (eventData: Partial<Event>): Promise<void> => {
      if (!user) {
        throw new Error('Must be authenticated to create event');
      }

      if (!orgId) {
        throw new Error('Organization ID is required');
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch('/api/events', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            ...eventData,
            organizationId: orgId,
          }),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to create event');
        }
      } catch (err) {
        console.error('Error creating event:', err);
        throw err;
      }
    },
    [user, orgId]
  );

  const updateEvent = useCallback(
    async (eventId: string, updates: Partial<Event>): Promise<void> => {
      if (!user) {
        throw new Error('Must be authenticated to update event');
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch(`/api/events/${eventId}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify(updates),
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to update event');
        }
      } catch (err) {
        console.error('Error updating event:', err);
        throw err;
      }
    },
    [user]
  );

  const deleteEvent = useCallback(
    async (eventId: string): Promise<void> => {
      if (!user) {
        throw new Error('Must be authenticated to delete event');
      }

      try {
        const token = await user.getIdToken();

        const response = await fetch(`/api/events/${eventId}`, {
          method: 'DELETE',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Failed to delete event');
        }
      } catch (err) {
        console.error('Error deleting event:', err);
        throw err;
      }
    },
    [user]
  );

  return {
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
