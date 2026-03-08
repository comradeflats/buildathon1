'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/lib/types';

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const q = query(collection(db, 'events'), orderBy('createdAt', 'desc'));

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
        console.error('Error fetching events:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  const getEventById = useCallback(
    (id: string): Event | undefined => {
      return events.find((event) => event.id === id);
    },
    [events]
  );

  const getActiveEvents = useCallback((): Event[] => {
    return events.filter((event) => event.status === 'active');
  }, [events]);

  const getEventsForSubmission = useCallback((): Event[] => {
    return events.filter((event) => event.status === 'active' || event.status === 'upcoming');
  }, [events]);

  const createEvent = useCallback(async (event: Event): Promise<void> => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          adminSession: 'authenticated',
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
  }, []);

  const updateEvent = useCallback(async (event: Event): Promise<void> => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          event,
          adminSession: 'authenticated',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to update event');
      }
    } catch (err) {
      console.error('Error updating event:', err);
      throw err;
    }
  }, []);

  const deleteEvent = useCallback(async (eventId: string): Promise<void> => {
    try {
      const response = await fetch('/api/admin/events', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          eventId,
          adminSession: 'authenticated',
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to delete event');
      }
    } catch (err) {
      console.error('Error deleting event:', err);
      throw err;
    }
  }, []);

  return {
    events,
    isLoading,
    error,
    getEventById,
    getActiveEvents,
    getEventsForSubmission,
    createEvent,
    updateEvent,
    deleteEvent,
  };
}
