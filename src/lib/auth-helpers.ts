import { NextRequest } from 'next/server';
import { getAuthAdmin } from './firebase-admin';
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

  const hasAccess = await isOrgAdmin(user.uid, orgId);

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

  const isMember = await isOrgMember(user.uid, orgId);

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
  return await getOrgPermissions(userId, orgId);
}

/**
 * Middleware helper to handle authentication errors
 */
export function handleAuthError(error: unknown): Response {
  if (error instanceof Error) {
    const message = error.message;

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
    { error: 'Authentication error' },
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
