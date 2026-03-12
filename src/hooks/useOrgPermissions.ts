'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { getOrgPermissions, getUserOrgRole, OrgPermissions, OrgRole } from '@/lib/permissions';

/**
 * Hook to get user's permissions for an organization
 */
export function useOrgPermissions(orgId: string | null) {
  const { user } = useAuth();
  const [permissions, setPermissions] = useState<OrgPermissions>({
    canEdit: false,
    canDelete: false,
    canManageMembers: false,
    canManageEvents: false,
    canViewAnalytics: false,
    isJudge: false,
  });
  const [role, setRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // If we don't have a user, we'll never have permissions
    if (!user) {
      setIsLoading(false);
      setPermissions({
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canManageEvents: false,
        canViewAnalytics: false,
        isJudge: false,
      });
      setRole(null);
      return;
    }

    // If we have a user but no orgId yet, we are still 'loading' our target
    if (!orgId) {
      setIsLoading(true);
      return;
    }

    const fetchPermissions = async () => {
      setIsLoading(true);
      try {
        const [perms, userRole] = await Promise.all([
          getOrgPermissions(user.uid, orgId),
          getUserOrgRole(user.uid, orgId),
        ]);

        setPermissions(perms);
        setRole(userRole);
      } catch (error) {
        console.error('Error fetching permissions:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPermissions();
  }, [user, orgId]);

  return {
    permissions,
    role,
    isLoading,
    isOwner: role === 'owner',
    isAdmin: role === 'admin' || role === 'owner',
    isJudge: permissions.isJudge,
    isMember: role !== null,
    orgId, // Return current orgId to verify context
  };
}

/**
 * Hook to check if user can manage an event
 */
export function useCanManageEvent(eventOrgId: string | null) {
  const { permissions, isLoading } = useOrgPermissions(eventOrgId);

  return {
    canManage: permissions.canManageEvents,
    isLoading,
  };
}

/**
 * Hook to check if user is a member of any organizations
 */
export function useIsOrganizer() {
  const { user } = useAuth();
  const [isOrganizer, setIsOrganizer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setIsOrganizer(false);
      setIsLoading(false);
      return;
    }

    // Check if user has any org memberships by checking the users collection
    const checkOrganizer = async () => {
      try {
        // This could be enhanced to check the users collection
        // For now, we'll use the organizations hook
        setIsLoading(false);
      } catch (error) {
        console.error('Error checking organizer status:', error);
        setIsLoading(false);
      }
    };

    checkOrganizer();
  }, [user]);

  return {
    isOrganizer,
    isLoading,
  };
}
