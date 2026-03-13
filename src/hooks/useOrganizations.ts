'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  collection,
  doc,
  getDoc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { Organization, OrgMember } from '@/lib/types';
import { useAuth } from '@/context/AuthContext';
import { generateOrgSlug, validateSlug } from '@/lib/slugs';

export interface CreateOrgData {
  name: string;
  slug?: string;
  description?: string;
  logoUrl?: string;
  websiteUrl?: string;
  settings?: {
    allowPublicEventDiscovery: boolean;
    branding?: {
      primaryColor?: string;
      accentColor?: string;
      bannerUrl?: string;
    };
    accessControl?: {
      inviteLinkEnabled: boolean;
      inviteLinkCode?: string;
      defaultRole?: 'admin' | 'member' | 'judge';
    };
  };
}

export function useOrganizations() {
  const { user } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch user's organizations
  useEffect(() => {
    if (!db || !user) {
      setIsLoading(false);
      setOrganizations([]);
      return;
    }

    // Get user's org memberships
    const membersRef = collection(db, 'orgMembers');
    const q = query(membersRef, where('userId', '==', user.uid));

    const unsubscribe = onSnapshot(
      q,
      async (snapshot) => {
        if (snapshot.empty) {
          setOrganizations([]);
          setIsLoading(false);
          return;
        }

        // Get organization IDs
        const orgIds = snapshot.docs.map(
          (doc) => (doc.data() as OrgMember).organizationId
        );

        // Fetch organizations
        const orgsPromises = orgIds.map(async (orgId) => {
          const orgDoc = await getDoc(doc(db, 'organizations', orgId));
          if (orgDoc.exists()) {
            return {
              id: orgDoc.id,
              ...orgDoc.data(),
            } as Organization;
          }
          return null;
        });

        const orgs = (await Promise.all(orgsPromises)).filter(
          (org): org is Organization => org !== null
        );

        setOrganizations(orgs);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching organizations:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [user]);

  const createOrganization = useCallback(
    async (data: CreateOrgData): Promise<Organization> => {
      if (!user) {
        throw new Error('Must be authenticated to create organization');
      }

      // Generate slug if not provided
      const slug = data.slug
        ? data.slug
        : await generateOrgSlug(data.name);

      if (!validateSlug(slug)) {
        throw new Error('Invalid slug format');
      }

      try {
        // Create organization
        const orgData = {
          name: data.name,
          slug,
          description: data.description || '',
          logoUrl: data.logoUrl || '',
          websiteUrl: data.websiteUrl || '',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: user.uid,
          memberCount: 1,
          settings: data.settings || {
            allowPublicEventDiscovery: true,
            branding: {
              primaryColor: '#10b981',
              accentColor: '#06b6d4',
            },
            accessControl: {
              inviteLinkEnabled: false,
              defaultRole: 'member'
            }
          },
        };

        const orgRef = await addDoc(collection(db, 'organizations'), orgData);

        // Add creator as owner
        const memberData = {
          organizationId: orgRef.id,
          userId: user.uid,
          role: 'owner' as const,
          email: user.email || '',
          displayName: user.displayName || '',
          joinedAt: new Date().toISOString(),
        };

        await addDoc(collection(db, 'orgMembers'), memberData);

        return {
          id: orgRef.id,
          ...orgData,
        };
      } catch (err) {
        console.error('Error creating organization:', err);
        throw err;
      }
    },
    [user]
  );

  const updateOrganization = useCallback(
    async (orgId: string, updates: Partial<Organization>): Promise<void> => {
      try {
        const orgRef = doc(db, 'organizations', orgId);
        await updateDoc(orgRef, {
          ...updates,
          updatedAt: new Date().toISOString(),
        });
      } catch (err) {
        console.error('Error updating organization:', err);
        throw err;
      }
    },
    []
  );

  const deleteOrganization = useCallback(async (orgId: string): Promise<void> => {
    try {
      // Delete all org members
      const membersRef = collection(db, 'orgMembers');
      const q = query(membersRef, where('organizationId', '==', orgId));
      const snapshot = await getDocs(q);

      await Promise.all(
        snapshot.docs.map((doc) => deleteDoc(doc.ref))
      );

      // Delete organization
      await deleteDoc(doc(db, 'organizations', orgId));
    } catch (err) {
      console.error('Error deleting organization:', err);
      throw err;
    }
  }, []);

  const getOrganizationById = useCallback(
    (orgId: string): Organization | undefined => {
      return organizations.find((org) => org.id === orgId);
    },
    [organizations]
  );

  const getOrganizationBySlug = useCallback(
    (slug: string): Organization | undefined => {
      return organizations.find((org) => org.slug === slug);
    },
    [organizations]
  );

  return {
    organizations,
    isLoading,
    error,
    createOrganization,
    updateOrganization,
    deleteOrganization,
    getOrganizationById,
    getOrganizationBySlug,
  };
}

/**
 * Hook to fetch a single organization by ID
 */
export function useOrganization(orgId: string | null) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !orgId) {
      setIsLoading(false);
      return;
    }

    const orgRef = doc(db, 'organizations', orgId);

    const unsubscribe = onSnapshot(
      orgRef,
      (snapshot) => {
        if (snapshot.exists()) {
          setOrganization({
            id: snapshot.id,
            ...snapshot.data(),
          } as Organization);
        } else {
          setOrganization(null);
          setError('Organization not found');
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching organization:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [orgId]);

  return { organization, isLoading, error };
}

/**
 * Hook to fetch a single organization by slug
 */
export function useOrganizationBySlug(slug: string | null) {
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db || !slug) {
      setIsLoading(false);
      return;
    }

    const orgsRef = collection(db, 'organizations');
    const q = query(orgsRef, where('slug', '==', slug));

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        if (!snapshot.empty) {
          const orgDoc = snapshot.docs[0];
          setOrganization({
            id: orgDoc.id,
            ...orgDoc.data(),
          } as Organization);
          setError(null);
        } else {
          setOrganization(null);
          setError('Organization not found');
        }
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching organization by slug:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, [slug]);

  return { organization, isLoading, error };
}

/**
 * Hook to fetch all public organizations for the discovery portal
 */
export function usePublicOrganizations() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!db) {
      setIsLoading(false);
      return;
    }

    const orgsRef = collection(db, 'organizations');
    // In a real app we might want to only fetch orgs that have allowPublicEventDiscovery: true
    const q = query(orgsRef);

    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const orgsData = snapshot.docs.map((doc) => ({
          ...doc.data(),
          id: doc.id,
        })) as Organization[];

        setOrganizations(orgsData);
        setIsLoading(false);
      },
      (err) => {
        console.error('Error fetching public organizations:', err);
        setError(err.message);
        setIsLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { organizations, isLoading, error };
}
