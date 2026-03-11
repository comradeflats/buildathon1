import { NextRequest, NextResponse } from 'next/server';
import { getFirestoreAdmin } from '@/lib/firebase-admin';
import { requireOrgAdmin, handleAuthError } from '@/lib/auth-helpers';
import { isOrgOwner } from '@/lib/permissions';

/**
 * GET /api/organizations/[orgId]
 * Fetch a single organization by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const db = getFirestoreAdmin();
    const orgDoc = await db.collection('organizations').doc(params.orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      id: orgDoc.id,
      ...orgDoc.data(),
    });
  } catch (error) {
    console.error('Error fetching organization:', error);
    return NextResponse.json(
      { error: 'Failed to fetch organization' },
      { status: 500 }
    );
  }
}

/**
 * PUT /api/organizations/[orgId]
 * Update an organization (requires org admin authentication)
 */
export async function PUT(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const db = getFirestoreAdmin();

    // Verify user is org admin
    const user = await requireOrgAdmin(request, params.orgId);

    const body = await request.json();

    // Remove fields that shouldn't be updated directly
    const { id, slug, createdAt, createdBy, memberCount, ...updates } = body;

    // Update organization
    await db.collection('organizations').doc(params.orgId).update({
      ...updates,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}

/**
 * DELETE /api/organizations/[orgId]
 * Delete an organization (requires org owner authentication)
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: { orgId: string } }
) {
  try {
    const db = getFirestoreAdmin();

    // Get org to verify it exists
    const orgDoc = await db.collection('organizations').doc(params.orgId).get();

    if (!orgDoc.exists) {
      return NextResponse.json(
        { error: 'Organization not found' },
        { status: 404 }
      );
    }

    // Verify user is org owner (only owners can delete orgs)
    const user = await requireOrgAdmin(request, params.orgId);
    const isOwner = await isOrgOwner(user.uid, params.orgId);

    if (!isOwner) {
      return NextResponse.json(
        { error: 'Only organization owners can delete organizations' },
        { status: 403 }
      );
    }

    // Check if org has any events
    const eventsSnapshot = await db
      .collection('events')
      .where('organizationId', '==', params.orgId)
      .limit(1)
      .get();

    if (!eventsSnapshot.empty) {
      return NextResponse.json(
        { error: 'Cannot delete organization with existing events. Delete all events first.' },
        { status: 400 }
      );
    }

    // Delete all org members
    const membersSnapshot = await db
      .collection('orgMembers')
      .where('organizationId', '==', params.orgId)
      .get();

    const batch = db.batch();
    membersSnapshot.docs.forEach((doc) => {
      batch.delete(doc.ref);
    });

    // Delete organization
    batch.delete(db.collection('organizations').doc(params.orgId));

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    return handleAuthError(error);
  }
}
