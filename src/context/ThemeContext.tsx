'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';

type Theme = 'dark' | 'colorblind';

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    const saved = localStorage.getItem('theme');
    // Convert legacy 'light' to 'dark'
    if (saved === 'light') {
      setThemeState('dark');
    } else if (saved && ['dark', 'colorblind'].includes(saved)) {
      setThemeState(saved as Theme);
    }
  }, []);

  useEffect(() => {
    if (!mounted) return;
    document.documentElement.classList.remove('dark', 'colorblind');
    document.documentElement.classList.add(theme);
    localStorage.setItem('theme', theme);
  }, [theme, mounted]);

  const setTheme = (newTheme: Theme) => setThemeState(newTheme);

  // Always provide context, even before mounted
  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);

  // Return default during SSR to prevent build errors
  if (typeof window === 'undefined' && !context) {
    return { theme: 'dark' as Theme, setTheme: () => {} };
  }

  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
}
