'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth';
import { auth, githubProvider, googleProvider, db } from '@/lib/firebase';
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
  signInWithGoogle: () => Promise<void>;
  signInWithEmail: (email: string, password: string) => Promise<void>;
  signUpWithEmail: (email: string, password: string) => Promise<void>;
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

    let isMounted = true;
    let unsubscribe: (() => void) | undefined;

    async function initializeAuth() {
      console.log('[AUTH] initializeAuth called');
      const isMobile = isMobileDevice();
      console.log('[AUTH] isMobile:', isMobile);

      try {
        // First, check for redirect result (for mobile auth)
        // CRITICAL: We MUST wait for this before setting isLoading to false
        console.log('[AUTH] Checking redirect result...');
        const result = await getRedirectResult(auth);
        
        if (result?.user && isMounted) {
          console.log('[AUTH] Setting user from redirect result:', result.user.uid);
          setUser(result.user);
          setAuthError(null);
        } else if (result === null) {
          console.log('[AUTH] No redirect result found');
        }
      } catch (error: any) {
        console.error('[AUTH] Redirect error:', error);
        if (isMounted) {
          setAuthError(`Redirect error: ${error?.code || error?.message || 'Unknown'}`);
        }
      }

      // Then set up the auth state listener
      console.log('[AUTH] Setting up auth state listener');
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
        if (!isMounted) return;
        
        console.log('[AUTH] Auth state changed:', firebaseUser ? `User ${firebaseUser.uid} present` : 'No user');
        
        if (firebaseUser) {
          setUser(firebaseUser);
          setAuthError(null);
          
          // Pre-fetch profile to avoid layout shifts in consumers
          try {
            const userDocRef = doc(db, 'users', firebaseUser.uid);
            const userDoc = await getDoc(userDocRef);
            if (userDoc.exists() && isMounted) {
              setUserProfile({ id: userDoc.id, ...userDoc.data() } as UserProfile);
            }
          } catch (e) {
            console.error('[AUTH] Profile fetch error:', e);
          }
        } else {
          setUser(null);
          setUserProfile(null);
        }
        
        setIsLoading(false);
      });
    }

    initializeAuth();

    return () => {
      isMounted = false;
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, []);

  const signInWithGitHub = useCallback(async (): Promise<void> => {
    console.log('[AUTH] signInWithGitHub called');
    const isMobile = isMobileDevice();
    console.log('[AUTH] isMobile:', isMobile);
    setAuthError(null);

    if (!auth || !githubProvider) {
      const err = 'Firebase not initialized';
      console.error('[AUTH]', err);
      setAuthError(err);
      throw new Error(err);
    }

    try {
      // Use redirect on mobile, popup on desktop
      if (isMobile) {
        console.log('[AUTH] Using signInWithRedirect...');
        await signInWithRedirect(auth, githubProvider);
        console.log('[AUTH] Redirect initiated');
      } else {
        console.log('[AUTH] Using signInWithPopup...');
        try {
          await signInWithPopup(auth, githubProvider);
          console.log('[AUTH] Popup auth complete');
        } catch (popupError: any) {
          // If popup is blocked or not supported, try redirect
          if (popupError.code === 'auth/operation-not-supported-in-this-environment' || 
              popupError.code === 'auth/popup-blocked') {
            console.warn('[AUTH] Popup failed, falling back to redirect');
            await signInWithRedirect(auth, githubProvider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error: any) {
      console.error('[AUTH] Sign-in error:', error);
      setAuthError(`Sign-in error: ${error?.code || error?.message || 'Unknown'}`);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    console.log('[AUTH] signInWithGoogle called');
    const isMobile = isMobileDevice();
    setAuthError(null);

    if (!auth || !googleProvider) {
      const err = 'Firebase not initialized';
      console.error('[AUTH]', err);
      setAuthError(err);
      throw new Error(err);
    }

    try {
      if (isMobile) {
        await signInWithRedirect(auth, googleProvider);
      } else {
        try {
          await signInWithPopup(auth, googleProvider);
        } catch (popupError: any) {
          if (popupError.code === 'auth/operation-not-supported-in-this-environment' || 
              popupError.code === 'auth/popup-blocked') {
            await signInWithRedirect(auth, googleProvider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error: any) {
      console.error('[AUTH] Google Sign-in error:', error);
      setAuthError(`Google Sign-in error: ${error?.code || error?.message || 'Unknown'}`);
      throw error;
    }
  }, []);

  const signInWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    console.log('[AUTH] signInWithEmail called');
    setAuthError(null);

    if (!auth) {
      const err = 'Firebase not initialized';
      console.error('[AUTH]', err);
      setAuthError(err);
      throw new Error(err);
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('[AUTH] Email Sign-in error:', error);
      setAuthError(`Email Sign-in error: ${error?.code || error?.message || 'Unknown'}`);
      throw error;
    }
  }, []);

  const signUpWithEmail = useCallback(async (email: string, password: string): Promise<void> => {
    console.log('[AUTH] signUpWithEmail called');
    setAuthError(null);

    if (!auth) {
      const err = 'Firebase not initialized';
      console.error('[AUTH]', err);
      setAuthError(err);
      throw new Error(err);
    }

    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      console.error('[AUTH] Email Sign-up error:', error);
      setAuthError(`Email Sign-up error: ${error?.code || error?.message || 'Unknown'}`);
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
    if (!user) {
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
        signInWithGoogle,
        signInWithEmail,
        signUpWithEmail,
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
