'use client';

import { useState, useEffect, useCallback } from 'react';
import { Theme } from '@/lib/types';

export function useThemes() {
  const [themes, setThemes] = useState<Theme[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchThemes() {
      try {
        const isProd = process.env.NODE_ENV === 'production';
        const prefix = isProd ? '/buildathon1' : '';
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
    }

    fetchThemes();
  }, []);

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

  return { themes, isLoading, error, getThemeById, getThemeCriteria };
}
