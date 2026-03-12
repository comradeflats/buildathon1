import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { OrgMember } from '@/lib/types';

export type OrgRole = 'owner' | 'admin' | 'member' | 'judge';

export interface OrgPermissions {
  canEdit: boolean;
  canDelete: boolean;
  canManageMembers: boolean;
  canManageEvents: boolean;
  canViewAnalytics: boolean;
  isJudge: boolean;
}

/**
 * Get user's role in an organization
 */
export async function getUserOrgRole(
  userId: string,
  orgId: string
): Promise<OrgRole | null> {
  try {
    // Try with compound key first (userId_orgId)
    const memberDocRef = doc(db, 'orgMembers', `${userId}_${orgId}`);
    const memberDoc = await getDoc(memberDocRef);

    if (memberDoc.exists()) {
      const data = memberDoc.data() as OrgMember;
      return data.role;
    }

    // Fallback: query by userId and organizationId
    const membersRef = collection(db, 'orgMembers');
    const q = query(
      membersRef,
      where('userId', '==', userId),
      where('organizationId', '==', orgId)
    );

    const snapshot = await getDocs(q);

    if (!snapshot.empty) {
      const data = snapshot.docs[0].data() as OrgMember;
      return data.role;
    }

    return null;
  } catch (error) {
    console.error('Error getting user org role:', error);
    return null;
  }
}

/**
 * Check if user is a member of an organization
 */
export async function isOrgMember(
  userId: string,
  orgId: string
): Promise<boolean> {
  const role = await getUserOrgRole(userId, orgId);
  return role !== null;
}

/**
 * Check if user is an admin or owner of an organization
 */
export async function isOrgAdmin(
  userId: string,
  orgId: string
): Promise<boolean> {
  const role = await getUserOrgRole(userId, orgId);
  return role === 'admin' || role === 'owner';
}

/**
 * Check if user is the owner of an organization
 */
export async function isOrgOwner(
  userId: string,
  orgId: string
): Promise<boolean> {
  const role = await getUserOrgRole(userId, orgId);
  return role === 'owner';
}

/**
 * Get permissions for a user in an organization
 */
export async function getOrgPermissions(
  userId: string,
  orgId: string
): Promise<OrgPermissions> {
  const role = await getUserOrgRole(userId, orgId);

  if (!role) {
    return {
      canEdit: false,
      canDelete: false,
      canManageMembers: false,
      canManageEvents: false,
      canViewAnalytics: false,
      isJudge: false,
    };
  }

  switch (role) {
    case 'owner':
      return {
        canEdit: true,
        canDelete: true,
        canManageMembers: true,
        canManageEvents: true,
        canViewAnalytics: true,
        isJudge: true,
      };
    case 'admin':
      return {
        canEdit: true,
        canDelete: false,
        canManageMembers: true,
        canManageEvents: true,
        canViewAnalytics: true,
        isJudge: true,
      };
    case 'judge':
      return {
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canManageEvents: false,
        canViewAnalytics: true,
        isJudge: true,
      };
    case 'member':
      return {
        canEdit: false,
        canDelete: false,
        canManageMembers: false,
        canManageEvents: false,
        canViewAnalytics: true,
        isJudge: false,
      };
  }
}

/**
 * Check if user can manage an event
 */
export async function canManageEvent(
  userId: string,
  eventOrgId: string
): Promise<boolean> {
  return await isOrgAdmin(userId, eventOrgId);
}

/**
 * Check if user can manage a team (either team owner or org admin)
 */
export async function canManageTeam(
  userId: string,
  teamOwnerId: string | null | undefined,
  teamOrgId: string | undefined
): Promise<boolean> {
  // Check if user is the team owner
  if (teamOwnerId && userId === teamOwnerId) {
    return true;
  }

  // Check if user is an org admin
  if (teamOrgId) {
    return await isOrgAdmin(userId, teamOrgId);
  }

  return false;
}

/**
 * Get all organizations where user is a member
 */
export async function getUserOrganizations(userId: string): Promise<string[]> {
  try {
    const membersRef = collection(db, 'orgMembers');
    const q = query(membersRef, where('userId', '==', userId));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => doc.data().organizationId);
  } catch (error) {
    console.error('Error getting user organizations:', error);
    return [];
  }
}

/**
 * Get all members of an organization
 */
export async function getOrgMembers(orgId: string): Promise<OrgMember[]> {
  try {
    const membersRef = collection(db, 'orgMembers');
    const q = query(membersRef, where('organizationId', '==', orgId));

    const snapshot = await getDocs(q);

    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as OrgMember));
  } catch (error) {
    console.error('Error getting org members:', error);
    return [];
  }
}
