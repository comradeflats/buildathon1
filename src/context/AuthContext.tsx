'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { User, onAuthStateChanged, signInWithPopup, signInWithRedirect, getRedirectResult, signInAnonymously as firebaseSignInAnonymously, signOut as firebaseSignOut, signInWithEmailAndPassword, createUserWithEmailAndPassword, sendEmailVerification } from 'firebase/auth';
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
  isRedirecting: boolean;
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
  migrateGuestData: () => Promise<{ success: boolean; summary?: any; error?: string }>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [ownershipToken, setOwnershipToken] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isRedirecting, setIsRedirecting] = useState(false);

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
      console.log('[AUTH] isMobile:', isMobile, 'window.innerWidth:', typeof window !== 'undefined' ? window.innerWidth : 'n/a');

      let redirectChecked = false;
      let authStateReceived = false;

      const checkComplete = () => {
        if (redirectChecked && authStateReceived && isMounted) {
          console.log('[AUTH] Both redirect and auth state checked, setting isLoading(false)');
          setIsLoading(false);
        }
      };

      try {
        // First, check for redirect result (for mobile auth)
        console.log('[AUTH] Checking redirect result...');
        const result = await getRedirectResult(auth);

        if (result?.user && isMounted) {
          console.log('[AUTH] ✓ Redirect successful! User:', result.user.uid, 'Provider:', result.providerId);
          setUser(result.user);
          setAuthError(null);
          setIsRedirecting(false);
        } else if (result === null) {
          console.log('[AUTH] No redirect result found (user may not have come from auth redirect)');
        }
      } catch (error: any) {
        console.error('[AUTH] ✗ Redirect error:', error);
        if (isMounted) {
          const errorMessage = error?.code === 'auth/popup-closed-by-user'
            ? 'Authentication was cancelled. Please try again.'
            : error?.code === 'auth/network-request-failed'
            ? 'Network error. Please check your connection and try again.'
            : error?.code === 'auth/unauthorized-domain'
            ? 'This domain is not authorized for authentication. Please contact support.'
            : `Authentication error: ${error?.code || error?.message || 'Unknown'}`;
          setAuthError(errorMessage);
          setIsRedirecting(false);
        }
      } finally {
        redirectChecked = true;
        checkComplete();
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
        
        authStateReceived = true;
        checkComplete();
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
    console.log('[AUTH] Device type - Mobile:', isMobile);
    setAuthError(null);

    if (!auth || !githubProvider) {
      const err = 'Firebase not initialized';
      console.error('[AUTH]', err);
      setAuthError(err);
      throw new Error(err);
    }

    try {
      // ALWAYS use redirect on mobile - no popup fallback
      if (isMobile) {
        console.log('[AUTH] Mobile device detected - using signInWithRedirect (required for mobile browsers)');
        setIsRedirecting(true);
        await signInWithRedirect(auth, githubProvider);
        console.log('[AUTH] ✓ Redirect initiated - browser will navigate to GitHub');
        // Note: Code after signInWithRedirect won't execute as page will redirect
      } else {
        // Desktop: Use popup
        console.log('[AUTH] Desktop device - using signInWithPopup');
        try {
          await signInWithPopup(auth, githubProvider);
          console.log('[AUTH] ✓ Popup auth completed successfully');
        } catch (popupError: any) {
          // If popup is blocked on desktop, fallback to redirect
          if (popupError.code === 'auth/popup-blocked') {
            console.warn('[AUTH] Popup blocked - falling back to redirect');
            setIsRedirecting(true);
            await signInWithRedirect(auth, githubProvider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error: any) {
      console.error('[AUTH] ✗ GitHub sign-in error:', error);
      const errorMessage = error?.code === 'auth/popup-closed-by-user'
        ? 'Authentication was cancelled. Please try again.'
        : error?.code === 'auth/network-request-failed'
        ? 'Network error. Please check your connection and try again.'
        : `Sign-in error: ${error?.code || error?.message || 'Unknown'}`;
      setAuthError(errorMessage);
      setIsRedirecting(false);
      throw error;
    }
  }, []);

  const signInWithGoogle = useCallback(async (): Promise<void> => {
    console.log('[AUTH] signInWithGoogle called');
    const isMobile = isMobileDevice();
    console.log('[AUTH] Device type - Mobile:', isMobile);
    setAuthError(null);

    if (!auth || !googleProvider) {
      const err = 'Firebase not initialized';
      console.error('[AUTH]', err);
      setAuthError(err);
      throw new Error(err);
    }

    try {
      // ALWAYS use redirect on mobile - no popup fallback
      if (isMobile) {
        console.log('[AUTH] Mobile device detected - using signInWithRedirect (required for mobile browsers)');
        setIsRedirecting(true);
        await signInWithRedirect(auth, googleProvider);
        console.log('[AUTH] ✓ Redirect initiated - browser will navigate to Google');
        // Note: Code after signInWithRedirect won't execute as page will redirect
      } else {
        // Desktop: Use popup
        console.log('[AUTH] Desktop device - using signInWithPopup');
        try {
          await signInWithPopup(auth, googleProvider);
          console.log('[AUTH] ✓ Popup auth completed successfully');
        } catch (popupError: any) {
          // If popup is blocked on desktop, fallback to redirect
          if (popupError.code === 'auth/popup-blocked') {
            console.warn('[AUTH] Popup blocked - falling back to redirect');
            setIsRedirecting(true);
            await signInWithRedirect(auth, googleProvider);
          } else {
            throw popupError;
          }
        }
      }
    } catch (error: any) {
      console.error('[AUTH] ✗ Google sign-in error:', error);
      const errorMessage = error?.code === 'auth/popup-closed-by-user'
        ? 'Authentication was cancelled. Please try again.'
        : error?.code === 'auth/network-request-failed'
        ? 'Network error. Please check your connection and try again.'
        : `Sign-in error: ${error?.code || error?.message || 'Unknown'}`;
      setAuthError(errorMessage);
      setIsRedirecting(false);
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
      // Store current anonymous UID if user is anonymous (for guest migration)
      const wasAnonymous = user?.isAnonymous;
      const anonymousUid = wasAnonymous ? user?.uid : null;

      if (wasAnonymous && anonymousUid) {
        console.log('[AUTH] User is anonymous, storing UID for migration:', anonymousUid);
        localStorage.setItem('guestUidForMigration', anonymousUid);
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      console.log('[AUTH] Account created successfully');

      // Send email verification
      try {
        await sendEmailVerification(userCredential.user, {
          url: typeof window !== 'undefined' ? window.location.origin + '/dashboard' : '',
          handleCodeInApp: false,
        });
        console.log('[AUTH] Verification email sent');
      } catch (verificationError) {
        // Don't fail signup if verification email fails
        console.error('[AUTH] Failed to send verification email:', verificationError);
      }
    } catch (error: any) {
      console.error('[AUTH] Email Sign-up error:', error);
      setAuthError(`Email Sign-up error: ${error?.code || error?.message || 'Unknown'}`);
      throw error;
    }
  }, [user]);

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

  // Migrate guest data after account upgrade
  const migrateGuestData = useCallback(async (): Promise<{ success: boolean; summary?: any; error?: string }> => {
    console.log('[AUTH] Checking for guest data migration...');

    // Check if there's a stored guest UID
    const guestUid = localStorage.getItem('guestUidForMigration');
    if (!guestUid) {
      console.log('[AUTH] No guest UID found, skipping migration');
      return { success: false, error: 'No guest data to migrate' };
    }

    // Get ownership token
    const token = await ensureOwnershipToken();
    if (!token) {
      console.error('[AUTH] No ownership token available');
      return { success: false, error: 'No ownership token available' };
    }

    try {
      const firebaseToken = await getFirebaseToken();
      if (!firebaseToken) {
        throw new Error('Authentication required');
      }

      console.log('[AUTH] Migrating guest data from UID:', guestUid);

      const response = await fetch('/api/user/migrate-guest-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${firebaseToken}`
        },
        body: JSON.stringify({
          guestUid,
          ownershipToken: token
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Migration failed');
      }

      // Clear the stored guest UID
      localStorage.removeItem('guestUidForMigration');

      console.log('[AUTH] Migration successful:', data.summary);
      return { success: true, summary: data.summary };
    } catch (error: any) {
      console.error('[AUTH] Migration error:', error);
      return { success: false, error: error.message };
    }
  }, [ensureOwnershipToken, getFirebaseToken]);

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
        isRedirecting,
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
        migrateGuestData,
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
