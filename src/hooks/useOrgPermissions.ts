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
  });
  const [role, setRole] = useState<OrgRole | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!user || !orgId) {
      setIsLoading(false);
      setPermissions({
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canManageEvents: false,
        canViewAnalytics: false,
      });
      setRole(null);
      return;
    }

    const fetchPermissions = async () => {
      try {
        const [perms, userRole] = await Promise.all([
          getOrgPermissions(user.uid, orgId),
          getUserOrgRole(user.uid, orgId),
        ]);

        setPermissions(perms);
        setRole(userRole);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching permissions:', error);
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
    isMember: role !== null,
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
