import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import { db as clientDb } from '@/lib/firebase';
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
 * Get user's role in an organization (Internal implementation)
 */
async function getUserOrgRoleInternal(
  db: any,
  userId: string,
  orgId: string
): Promise<OrgRole | null> {
  const isServer = typeof db.collection === 'function';
  try {
    // For Admin SDK (server-side)
    if (isServer) {
      console.log(`[PERMISSIONS] Server-side check for User:${userId} in Org:${orgId}`);
      const memberDoc = await db.collection('orgMembers').doc(`${userId}_${orgId}`).get();
      if (memberDoc.exists) {
        console.log(`[PERMISSIONS] Found role: ${memberDoc.data().role} via ID`);
        return memberDoc.data().role;
      }

      const snapshot = await db.collection('orgMembers')
        .where('userId', '==', userId)
        .where('organizationId', '==', orgId)
        .limit(1)
        .get();

      if (!snapshot.empty) {
        console.log(`[PERMISSIONS] Found role: ${snapshot.docs[0].data().role} via query`);
        return snapshot.docs[0].data().role;
      }
      console.warn(`[PERMISSIONS] No role found for User:${userId} in Org:${orgId}`);
      return null;
    }

    // For Client SDK (frontend)
    const memberDocRef = doc(db, 'orgMembers', `${userId}_${orgId}`);
    const memberDoc = await getDoc(memberDocRef);

    if (memberDoc.exists()) {
      const data = memberDoc.data() as OrgMember;
      return data.role;
    }

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
 * Get user's role in an organization (Public API, defaults to client db)
 */
export async function getUserOrgRole(
  userId: string,
  orgId: string,
  db: any = clientDb
): Promise<OrgRole | null> {
  return getUserOrgRoleInternal(db, userId, orgId);
}

/**
 * Check if user is a member of an organization
 */
export async function isOrgMember(
  userId: string,
  orgId: string,
  db: any = clientDb
): Promise<boolean> {
  const role = await getUserOrgRoleInternal(db, userId, orgId);
  return role !== null;
}

/**
 * Check if user is an admin or owner of an organization
 */
export async function isOrgAdmin(
  userId: string,
  orgId: string,
  db: any = clientDb
): Promise<boolean> {
  const role = await getUserOrgRoleInternal(db, userId, orgId);
  return role === 'admin' || role === 'owner';
}

/**
 * Check if user is the owner of an organization
 */
export async function isOrgOwner(
  userId: string,
  orgId: string,
  db: any = clientDb
): Promise<boolean> {
  const role = await getUserOrgRoleInternal(db, userId, orgId);
  return role === 'owner';
}

/**
 * Get permissions for a user in an organization
 */
export async function getOrgPermissions(
  userId: string,
  orgId: string,
  db: any = clientDb
): Promise<OrgPermissions> {
  const role = await getUserOrgRoleInternal(db, userId, orgId);

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
  eventOrgId: string,
  db: any = clientDb
): Promise<boolean> {
  return await isOrgAdmin(userId, eventOrgId, db);
}

/**
 * Check if user can manage a team (either team owner or org admin)
 */
export async function canManageTeam(
  userId: string,
  teamOwnerId: string | null | undefined,
  teamOrgId: string | undefined,
  db: any = clientDb
): Promise<boolean> {
  // Check if user is the team owner
  if (teamOwnerId && userId === teamOwnerId) {
    return true;
  }

  // Check if user is an org admin
  if (teamOrgId) {
    return await isOrgAdmin(userId, teamOrgId, db);
  }

  return false;
}

/**
 * Get all organizations where user is a member
 */
export async function getUserOrganizations(userId: string, db: any = clientDb): Promise<string[]> {
  try {
    // For Admin SDK
    if (typeof db.collection === 'function') {
      const snapshot = await db.collection('orgMembers').where('userId', '==', userId).get();
      return snapshot.docs.map((doc: any) => doc.data().organizationId);
    }

    // For Client SDK
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
export async function getOrgMembers(orgId: string, db: any = clientDb): Promise<OrgMember[]> {
  try {
    // For Admin SDK
    if (typeof db.collection === 'function') {
      const snapshot = await db.collection('orgMembers').where('organizationId', '==', orgId).get();
      return snapshot.docs.map((doc: any) => ({
        id: doc.id,
        ...doc.data()
      } as OrgMember));
    }

    // For Client SDK
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
