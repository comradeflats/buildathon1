import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';

/**
 * Generate a URL-friendly slug from a name
 */
export function createSlug(name: string): string {
  return name
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 100); // Limit length
}

/**
 * Validate slug format
 */
export function validateSlug(slug: string): boolean {
  if (!slug || slug.length === 0 || slug.length > 100) {
    return false;
  }
  return /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug);
}

/**
 * Check if a slug already exists for an organization
 */
export async function checkSlugExists(
  slug: string,
  orgId: string,
  excludeEventId?: string
): Promise<boolean> {
  try {
    const eventsRef = collection(db, 'events');
    const q = query(
      eventsRef,
      where('organizationId', '==', orgId),
      where('slug', '==', slug)
    );

    const snapshot = await getDocs(q);

    // If we're updating an event, exclude it from the check
    if (excludeEventId) {
      return snapshot.docs.some(doc => doc.id !== excludeEventId);
    }

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking slug existence:', error);
    throw error;
  }
}

/**
 * Check if a slug exists globally (for organizations)
 */
export async function checkOrgSlugExists(
  slug: string,
  excludeOrgId?: string
): Promise<boolean> {
  try {
    const orgsRef = collection(db, 'organizations');
    const q = query(orgsRef, where('slug', '==', slug));

    const snapshot = await getDocs(q);

    // If we're updating an org, exclude it from the check
    if (excludeOrgId) {
      return snapshot.docs.some(doc => doc.id !== excludeOrgId);
    }

    return !snapshot.empty;
  } catch (error) {
    console.error('Error checking org slug existence:', error);
    throw error;
  }
}

/**
 * Find an available slug by appending a counter if needed
 */
export async function findAvailableSlug(
  baseSlug: string,
  orgId: string
): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (await checkSlugExists(slug, orgId)) {
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit to prevent infinite loops
    if (counter > 100) {
      throw new Error('Could not find available slug');
    }
  }

  return slug;
}

/**
 * Find an available organization slug
 */
export async function findAvailableOrgSlug(baseSlug: string): Promise<string> {
  let slug = baseSlug;
  let counter = 2;

  while (await checkOrgSlugExists(slug)) {
    slug = `${baseSlug}-${counter}`;
    counter++;

    // Safety limit
    if (counter > 100) {
      throw new Error('Could not find available org slug');
    }
  }

  return slug;
}

/**
 * Generate a unique event slug for an organization
 */
export async function generateEventSlug(
  name: string,
  orgId: string
): Promise<string> {
  const baseSlug = createSlug(name);

  if (!validateSlug(baseSlug)) {
    throw new Error('Invalid slug format');
  }

  return await findAvailableSlug(baseSlug, orgId);
}

/**
 * Generate a unique organization slug
 */
export async function generateOrgSlug(name: string): Promise<string> {
  const baseSlug = createSlug(name);

  if (!validateSlug(baseSlug)) {
    throw new Error('Invalid slug format');
  }

  return await findAvailableOrgSlug(baseSlug);
}
