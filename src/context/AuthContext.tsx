'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, githubProvider } from '@/lib/firebase';
import { isMobileDevice } from '@/lib/deviceUtils';
import { getOwnershipToken, getOrCreateOwnershipToken } from '@/lib/indexeddb';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  ownershipToken: string | null;
  signInWithGitHub: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  ensureOwnershipToken: () => Promise<string>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownershipToken, setOwnershipToken] = useState<string | null>(null);

  // Load ownership token from IndexedDB on mount
  useEffect(() => {
    async function loadOwnershipToken() {
      try {
        const token = await getOwnershipToken();
        setOwnershipToken(token);
      } catch (error) {
        console.error('Failed to load ownership token:', error);
      }
    }
    loadOwnershipToken();
  }, []);

  // Handle redirect result and auth state changes
  // Combined into single useEffect to avoid race condition on mobile
  useEffect(() => {
    if (!auth) {
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    async function initializeAuth() {
      try {
        // First, check for redirect result (for mobile auth)
        // This must complete before we consider auth "loaded"
        const result = await getRedirectResult(auth);
        if (result?.user) {
          setUser(result.user);
        }
      } catch (error) {
        console.error('Redirect sign-in error:', error);
      }

      // Then set up the auth state listener
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        setUser(firebaseUser);
        setIsLoading(false);
      });
    }

    initializeAuth();

    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGitHub = useCallback(async (): Promise<void> => {
    if (!auth || !githubProvider) {
      throw new Error('Firebase not initialized');
    }

    try {
      // Use redirect on mobile, popup on desktop
      if (isMobileDevice()) {
        await signInWithRedirect(auth, githubProvider);
      } else {
        await signInWithPopup(auth, githubProvider);
      }
    } catch (error) {
      console.error('GitHub sign-in error:', error);
      throw error;
    }
  }, []);

  const signInAnonymously = useCallback(async (): Promise<void> => {
    if (!auth) {
      throw new Error('Firebase not initialized');
    }

    try {
      await firebaseSignInAnonymously(auth);
    } catch (error) {
      console.error('Anonymous sign-in error:', error);
      throw error;
    }
  }, []);

  const signOut = useCallback(async (): Promise<void> => {
    if (!auth) return;

    try {
      await firebaseSignOut(auth);
    } catch (error) {
      console.error('Sign-out error:', error);
      throw error;
    }
  }, []);

  const ensureOwnershipToken = useCallback(async (): Promise<string> => {
    if (ownershipToken) {
      return ownershipToken;
    }

    const token = await getOrCreateOwnershipToken();
    setOwnershipToken(token);
    return token;
  }, [ownershipToken]);

  const isAuthenticated = !!user;
  const isAnonymous = user?.isAnonymous ?? false;

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated,
        isAnonymous,
        isLoading,
        ownershipToken,
        signInWithGitHub,
        signInAnonymously,
        signOut,
        ensureOwnershipToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
