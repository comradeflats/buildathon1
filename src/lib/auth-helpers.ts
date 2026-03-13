import { NextRequest } from 'next/server';
import { getAuthAdmin, getFirestoreAdmin } from './firebase-admin';
import { isOrgAdmin, isOrgMember, getOrgPermissions } from './permissions';

export interface AuthUser {
  uid: string;
  email: string | undefined;
  emailVerified: boolean;
  displayName?: string;
  photoURL?: string;
}

/**
 * Extract Bearer token from Authorization header
 */
export function extractBearerToken(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');

  if (!authHeader) {
    return null;
  }

  const parts = authHeader.split(' ');
  if (parts.length !== 2 || parts[0] !== 'Bearer') {
    return null;
  }

  return parts[1];
}

/**
 * Verify Firebase ID token and return user info
 */
export async function verifyFirebaseToken(
  request: NextRequest
): Promise<AuthUser> {
  const token = extractBearerToken(request);

  if (!token) {
    throw new Error('No authorization token provided');
  }

  try {
    const auth = getAuthAdmin();
    const decodedToken = await auth.verifyIdToken(token);

    return {
      uid: decodedToken.uid,
      email: decodedToken.email,
      emailVerified: decodedToken.email_verified || false,
      displayName: decodedToken.name,
      photoURL: decodedToken.picture,
    };
  } catch (error) {
    console.error('Error verifying token:', error);
    throw new Error('Invalid or expired token');
  }
}

/**
 * Verify token and check if user has admin access to an organization
 */
export async function requireOrgAdmin(
  request: NextRequest,
  orgId: string
): Promise<AuthUser> {
  const user = await verifyFirebaseToken(request);
  const db = getFirestoreAdmin();

  console.log(`[AUTH-HELPERS] Checking admin for User:${user.uid} in Org:${orgId}`);
  let hasAccess = await isOrgAdmin(user.uid, orgId, db);

  if (!hasAccess) {
    // Fallback: Check if user is the creator of the organization
    const orgDoc = await db.collection('organizations').doc(orgId).get();
    const orgData = orgDoc.data();
    if (orgDoc.exists && orgData && orgData.createdBy === user.uid) {
      console.log(`[AUTH-HELPERS] User:${user.uid} is the CREATOR of Org:${orgId}. Granting access.`);
      hasAccess = true;
    }
  }

  if (!hasAccess) {
    throw new Error('Insufficient permissions: requires org admin access');
  }

  return user;
}

/**
 * Verify token and check if user is a member of an organization
 */
export async function requireOrgMember(
  request: NextRequest,
  orgId: string
): Promise<AuthUser> {
  const user = await verifyFirebaseToken(request);
  const db = getFirestoreAdmin();

  const isMember = await isOrgMember(user.uid, orgId, db);

  if (!isMember) {
    throw new Error('Not a member of this organization');
  }

  return user;
}

/**
 * Get user permissions for an organization
 */
export async function getUserOrgPermissions(
  userId: string,
  orgId: string
) {
  const db = getFirestoreAdmin();
  return await getOrgPermissions(userId, orgId, db);
}

/**
 * Middleware helper to handle authentication errors
 */
export function handleAuthError(error: unknown): Response {
  let message = 'Authentication error';
  
  if (error instanceof Error) {
    message = error.message;

    if (message.includes('No authorization token')) {
      return Response.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (message.includes('Invalid or expired token')) {
      return Response.json(
        { error: 'Invalid or expired token' },
        { status: 401 }
      );
    }

    if (message.includes('Insufficient permissions')) {
      return Response.json(
        { error: 'Insufficient permissions' },
        { status: 403 }
      );
    }

    if (message.includes('Not a member')) {
      return Response.json(
        { error: 'Access denied' },
        { status: 403 }
      );
    }
  }

  return Response.json(
    { error: message },
    { status: 500 }
  );
}

/**
 * Optional authentication - returns user if token is valid, null otherwise
 */
export async function optionalAuth(
  request: NextRequest
): Promise<AuthUser | null> {
  try {
    return await verifyFirebaseToken(request);
  } catch {
    return null;
  }
}
