'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  onSnapshot,
  query,
  orderBy,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Theme } from '@/lib/types';

export function useThemes(eventId?: string) {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchThemesFromJson = async () => {
      try {
        const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
        const prefix = isGithubActions ? '/buildathon1' : '';
        const response = await fetch(`${prefix}/themes.json`);

        if (!response.ok) {
          throw new Error('Failed to load themes');
        }
        const data: Theme[] = await response.json();
        setThemes(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    };

    if (!db) {
      // Fallback to static JSON for compatibility
      fetchThemesFromJson();
      return;
    }

    const q = query(collection(db, 'themes'), orderBy('name', 'asc'));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const themesData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Theme[];

        // Filter by eventId if provided
        const filteredThemes = eventId
          ? themesData.filter((theme) => theme.eventId === eventId)
          : themesData;

        setThemes(filteredThemes);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching themes:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [eventId]);

  const getThemeById = useCallback(
    (id: string): Theme | undefined => {
      return themes.find((theme) => theme.id === id);
    },
    [themes]
  );

  const getThemeCriteria = useCallback(
    (themeId: string): string[] => {
      const theme = getThemeById(themeId);
      return theme?.judgingCriteria || [];
    },
    [getThemeById]
  );

  const getThemesByEventId = useCallback(
    (eventId: string): Theme[] => {
      return themes.filter((theme) => theme.eventId === eventId);
    },
    [themes]
  );

  return { themes, isLoading, error, getThemeById, getThemeCriteria, getThemesByEventId };
}
