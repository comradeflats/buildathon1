'use client';

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';
import { Organization } from '@/lib/types';
import { useOrganizations } from '@/hooks/useOrganizations';
import { useOrgPermissions } from '@/hooks/useOrgPermissions';

interface OrgContextType {
  currentOrg: Organization | null;
  userOrgs: Organization[];
  isLoading: boolean;
  error: string | null;
  switchOrg: (orgId: string) => void;
  permissions: {
    canEdit: boolean;
    canDelete: boolean;
    canManageMembers: boolean;
    canManageEvents: boolean;
    canViewAnalytics: boolean;
    isJudge: boolean;
  };
  role: 'owner' | 'admin' | 'member' | 'judge' | null;
  isOwner: boolean;
  isAdmin: boolean;
  isJudge: boolean;
  isMember: boolean;
}

const OrgContext = createContext<OrgContextType | undefined>(undefined);

const CURRENT_ORG_STORAGE_KEY = 'buildathon-current-org-id';

export function OrgProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const { organizations, isLoading: orgsLoading } = useOrganizations();
  const [currentOrgId, setCurrentOrgId] = useState<string | null>(null);
  const [currentOrg, setCurrentOrg] = useState<Organization | null>(null);

  const { permissions, role, isLoading: permsLoading, isOwner, isAdmin, isJudge, isMember } = useOrgPermissions(currentOrgId);

  // Load current org from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedOrgId = localStorage.getItem(CURRENT_ORG_STORAGE_KEY);
      if (savedOrgId) {
        setCurrentOrgId(savedOrgId);
      }
    }
  }, []);

  // Update current org when organizations load or currentOrgId changes
  useEffect(() => {
    if (!organizations.length) {
      setCurrentOrg(null);
      return;
    }

    // If no current org is set, use the first one
    if (!currentOrgId) {
      const firstOrg = organizations[0];
      setCurrentOrgId(firstOrg.id);
      setCurrentOrg(firstOrg);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_ORG_STORAGE_KEY, firstOrg.id);
      }
      return;
    }

    // Find the current org in the list
    const org = organizations.find((o) => o.id === currentOrgId);

    if (org) {
      setCurrentOrg(org);
    } else {
      // Current org not found, switch to first org
      const firstOrg = organizations[0];
      setCurrentOrgId(firstOrg.id);
      setCurrentOrg(firstOrg);
      if (typeof window !== 'undefined') {
        localStorage.setItem(CURRENT_ORG_STORAGE_KEY, firstOrg.id);
      }
    }
  }, [organizations, currentOrgId]);

  const switchOrg = useCallback((orgId: string) => {
    setCurrentOrgId(orgId);
    if (typeof window !== 'undefined') {
      localStorage.setItem(CURRENT_ORG_STORAGE_KEY, orgId);
    }
  }, []);

  const isLoading = orgsLoading || permsLoading;

  return (
    <OrgContext.Provider
      value={{
        currentOrg,
        userOrgs: organizations,
        isLoading,
        error: null,
        switchOrg,
        permissions,
        role,
        isOwner,
        isAdmin,
        isJudge,
        isMember,
      }}
    >
      {children}
    </OrgContext.Provider>
  );
}

export function useOrg() {
  const context = useContext(OrgContext);
  if (context === undefined) {
    throw new Error('useOrg must be used within an OrgProvider');
  }
  return context;
}
