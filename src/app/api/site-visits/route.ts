import { NextRequest, NextResponse } from 'next/server';
import { ServerStore } from '@/lib/serverStore';

// GET /api/site-visits - List site visits
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const lead_id = searchParams.get('lead_id') || undefined;

    const visits = await ServerStore.getSiteVisits(status, lead_id);

    return NextResponse.json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch site visits' },
      { status: 500 }
    );
  }
}

// POST /api/site-visits - Schedule site visit
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.lead_id) {
      return NextResponse.json(
        { success: false, error: 'lead_id is required' },
        { status: 400 }
      );
    }

    const createdVisit = await ServerStore.createSiteVisit(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Site visit scheduled and dispatch notified',
        data: createdVisit,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to schedule site visit' },
      { status: 500 }
    );
  }
}

// PATCH /api/site-visits - Update visit
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Site visit ID is required.' },
        { status: 400 }
      );
    }

    const updated = await ServerStore.updateSiteVisit(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Site visit record not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Site visit updated successfully',
      data: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update site visit' },
      { status: 500 }
    );
  }
}
