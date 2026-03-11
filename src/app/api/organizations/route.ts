import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { verifyFirebaseToken, handleAuthError } from '@/lib/auth-helpers';
import { generateOrgSlug, validateSlug } from '@/lib/slugs';

/**
 * GET /api/organizations
 * Fetch organizations (public or user-specific)
 */
export async function GET(request: NextRequest) {
  try {
    const db = getFirestoreAdmin();
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const slug = searchParams.get('slug');

    // Fetch by slug
    if (slug) {
      const orgSnapshot = await db
        .collection('organizations')
        .where('slug', '==', slug)
        .limit(1)
        .get();

      if (orgSnapshot.empty) {
        return NextResponse.json(
          { error: 'Organization not found' },
          { status: 404 }
        );
      }

      const orgDoc = orgSnapshot.docs[0];
      return NextResponse.json({
        id: orgDoc.id,
        ...orgDoc.data(),
      });
    }

    // Fetch user's organizations
    if (userId) {
      // Get user's org memberships
      const membersSnapshot = await db
        .collection('orgMembers')
        .where('userId', '==', userId)
        .get();

      if (membersSnapshot.empty) {
        return NextResponse.json({ organizations: [] });
      }

      const orgIds = membersSnapshot.docs.map(
        (doc) => doc.data().organizationId
      );

      // Fetch organizations
      const orgsPromises = orgIds.map((orgId) =>
        db.collection('organizations').doc(orgId).get()
      );

      const orgDocs = await Promise.all(orgsPromises);

      const organizations = orgDocs
        .filter((doc) => doc.exists)
        .map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

      return NextResponse.json({ organizations });
    }

    // Fetch all public organizations
    const orgsSnapshot = await db
      .collection('organizations')
      .where('settings.allowPublicEventDiscovery', '==', true)
      .orderBy('createdAt', 'desc')
      .get();

    const organizations = orgsSnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    return NextResponse.json({ organizations });
  } catch (error) {
    console.error('Error fetching organizations:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organizations' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/organizations
 * Create a new organization (requires authentication)
 */
export async function POST(request: NextRequest) {
  try {
    const user = await verifyFirebaseToken(request);
    const body = await request.json();
    const { name, description, logoUrl, websiteUrl, slug, settings } = body;

    // Generate slug if not provided
    const orgSlug = slug || (await generateOrgSlug(name));

    // Validate slug format
    if (!validateSlug(orgSlug)) {
      return NextResponse.json(
        { error: 'Invalid slug format' },
        { status: 400 }
      );
    }

    const db = getFirestoreAdmin();

    // Create organization
    const orgData = {
      name,
      slug: orgSlug,
      description: description || '',
      logoUrl: logoUrl || '',
      websiteUrl: websiteUrl || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: user.uid,
      memberCount: 1,
      settings: settings || {
        allowPublicEventDiscovery: true,
      },
    };

    const orgRef = await db.collection('organizations').add(orgData);

    // Add creator as owner
    const memberData = {
      organizationId: orgRef.id,
      userId: user.uid,
      role: 'owner',
      email: user.email || '',
      displayName: user.displayName || '',
      joinedAt: new Date().toISOString(),
    };

    await db.collection('orgMembers').add(memberData);

    // Create or update user profile
    const userRef = db.collection('users').doc(user.uid);
    const userDoc = await userRef.get();

    if (userDoc.exists) {
      await userRef.update({
        isOrganizer: true,
        organizationIds: [...(userDoc.data()?.organizationIds || []), orgRef.id],
        lastLoginAt: new Date().toISOString(),
      });
    } else {
      await userRef.set({
        id: user.uid,
        email: user.email || '',
        displayName: user.displayName || '',
        photoUrl: user.photoURL || '',
        createdAt: new Date().toISOString(),
        lastLoginAt: new Date().toISOString(),
        isOrganizer: true,
        organizationIds: [orgRef.id],
      });
    }

    return NextResponse.json({
      success: true,
      organizationId: orgRef.id,
      slug: orgSlug,
    });
  } catch (error) {
    return handleAuthError(error);
  }
}
