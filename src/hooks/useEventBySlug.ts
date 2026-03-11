'use client';

import { useState, useEffect } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  onSnapshot,
  Query,
  DocumentData,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Event } from '@/lib/types';

export function useEventBySlug(slug: string) {
  const [event, setEvent] = useState<Event | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !slug) {
      setIsLoading(false);
      return;
    }

    const eventsRef = collection(db, 'events');
    const q: Query<DocumentData> = query(eventsRef, where('slug', '==', slug));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (snapshot.empty) {
          setEvent(null);
          setError('Event not found');
          setIsLoading(false);
          return;
        }

        const eventDoc = snapshot.docs[0];
        const eventData = {
          ...eventDoc.data(),
          id: eventDoc.id,
        } as Event;

        setEvent(eventData);
        setError(null);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching event by slug:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [slug]);

  return { event, isLoading, error };
}

/**
 * Fetch event by slug once (non-reactive)
 */
export async function getEventBySlug(slug: string): Promise<Event | null> {
  if (!db || !slug) {
    return null;
  }

  try {
    const eventsRef = collection(db, 'events');
    const q = query(eventsRef, where('slug', '==', slug));
    const snapshot = await getDocs(q);

    if (snapshot.empty) {
      return null;
    }

    const eventDoc = snapshot.docs[0];
    return {
      ...eventDoc.data(),
      id: eventDoc.id,
    } as Event;
  } catch (error) {
    console.error('Error getting event by slug:', error);
    return null;
  }
}
