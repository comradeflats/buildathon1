'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut } from 'firebase/auth';
import { auth, githubProvider, db } from '@/lib/firebase';
import { doc, getDoc } from 'firebase/firestore';
import { isMobileDevice } from '@/lib/deviceUtils';
import { getOwnershipToken, getOrCreateOwnershipToken } from '@/lib/indexeddb';
import { User as UserProfile } from '@/lib/types';

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAnonymous: boolean;
  isLoading: boolean;
  ownershipToken: string | null;
  authError: string | null;
  userProfile: UserProfile | null;
  signInWithGitHub: () => Promise<void>;
  signInAnonymously: () => Promise<void>;
  signOut: () => Promise<void>;
  ensureOwnershipToken: () => Promise<string>;
  clearAuthError: () => void;
  getUserProfile: () => Promise<UserProfile | null>;
  isOrganizer: () => boolean;
  getFirebaseToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownershipToken, setOwnershipToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);

  const clearAuthError = useCallback(() => {
    setAuthError(null);
  }, []);

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
    console.log('[AUTH] useEffect triggered, auth:', !!auth);

    if (!auth) {
      console.log('[AUTH] Firebase auth not initialized');
      setIsLoading(false);
      return;
    }

    let unsubscribe: (() => void) | undefined;

    async function initializeAuth() {
      console.log('[AUTH] initializeAuth called');
      console.log('[AUTH] isMobile:', isMobileDevice());
      console.log('[AUTH] Current URL:', typeof window !== 'undefined' ? window.location.href : 'N/A');

      try {
        // First, check for redirect result (for mobile auth)
        // This must complete before we consider auth "loaded"
        console.log('[AUTH] Checking redirect result...');
        const result = await getRedirectResult(auth);
        console.log('[AUTH] Redirect result:', result ? 'User found' : 'No user');
        if (result?.user) {
          console.log('[AUTH] Setting user from redirect result');
          setUser(result.user);
        }
      } catch (error: any) {
        console.error('[AUTH] Redirect error:', error);
        console.error('[AUTH] Error code:', error?.code);
        console.error('[AUTH] Error message:', error?.message);
        setAuthError(`Redirect error: ${error?.code || error?.message || 'Unknown'}`);
      }

      // Then set up the auth state listener
      console.log('[AUTH] Setting up auth state listener');
      unsubscribe = onAuthStateChanged(auth, (firebaseUser) => {
        console.log('[AUTH] Auth state changed:', firebaseUser ? 'User present' : 'No user');
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
    console.log('[AUTH] signInWithGitHub called');
    console.log('[AUTH] isMobile:', isMobileDevice());
    setAuthError(null);

    if (!auth || !githubProvider) {
      const err = 'Firebase not initialized';
      console.error('[AUTH]', err);
      setAuthError(err);
      throw new Error(err);
    }

    try {
      // Use redirect on mobile, popup on desktop
      if (isMobileDevice()) {
        console.log('[AUTH] Using signInWithRedirect...');
        await signInWithRedirect(auth, githubProvider);
        console.log('[AUTH] Redirect initiated');
      } else {
        console.log('[AUTH] Using signInWithPopup...');
        await signInWithPopup(auth, githubProvider);
        console.log('[AUTH] Popup auth complete');
      }
    } catch (error: any) {
      console.error('[AUTH] Sign-in error:', error);
      console.error('[AUTH] Error code:', error?.code);
      console.error('[AUTH] Error message:', error?.message);
      setAuthError(`Sign-in error: ${error?.code || error?.message || 'Unknown'}`);
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

  // Fetch user profile from Firestore
  const getUserProfile = useCallback(async (): Promise<UserProfile | null> => {
    if (!user || user.isAnonymous || !db) {
      return null;
    }

    try {
      const userDocRef = doc(db, 'users', user.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        return {
          id: userDoc.id,
          ...userDoc.data(),
        } as UserProfile;
      }

      return null;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }
  }, [user]);

  // Check if user is an organizer (has any organization memberships)
  const isOrganizer = useCallback((): boolean => {
    if (!userProfile) {
      return false;
    }
    return userProfile.isOrganizer || (userProfile.organizationIds?.length || 0) > 0;
  }, [userProfile]);

  // Get Firebase ID token for API calls
  const getFirebaseToken = useCallback(async (): Promise<string | null> => {
    if (!user || user.isAnonymous) {
      return null;
    }

    try {
      return await user.getIdToken();
    } catch (error) {
      console.error('Error getting Firebase token:', error);
      return null;
    }
  }, [user]);

  // Load user profile when user changes
  useEffect(() => {
    if (!user || user.isAnonymous) {
      setUserProfile(null);
      return;
    }

    getUserProfile().then((profile) => {
      setUserProfile(profile);
    });
  }, [user, getUserProfile]);

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
        authError,
        userProfile,
        signInWithGitHub,
        signInAnonymously,
        signOut,
        ensureOwnershipToken,
        clearAuthError,
        getUserProfile,
        isOrganizer,
        getFirebaseToken,
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
