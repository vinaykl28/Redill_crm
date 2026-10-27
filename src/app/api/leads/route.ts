import { NextRequest, NextResponse } from 'next/server';
import { ServerStore } from '@/lib/serverStore';

// GET /api/leads - Query leads with filters
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status') || undefined;
    const assigned_to = searchParams.get('assigned_to') || undefined;
    const source = searchParams.get('source') || undefined;
    const search = searchParams.get('search') || undefined;

    const leads = await ServerStore.getLeads({ status, assigned_to, source, search });

    return NextResponse.json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch leads' },
      { status: 500 }
    );
  }
}

// POST /api/leads - Create new lead or bulk import leads
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    // Check if bulk array import
    if (Array.isArray(body)) {
      const createdLeads = await ServerStore.bulkCreateLeads(body);
      return NextResponse.json(
        {
          success: true,
          message: `${createdLeads.length} leads imported successfully`,
          count: createdLeads.length,
          data: createdLeads,
        },
        { status: 201 }
      );
    }

    if (!body.name || !body.phone) {
      return NextResponse.json(
        { success: false, error: 'Name and phone number are required fields.' },
        { status: 400 }
      );
    }

    const createdLead = await ServerStore.createLead(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Lead created successfully',
        data: createdLead,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to create lead' },
      { status: 500 }
    );
  }
}

// PATCH /api/leads - Update lead
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required for updating.' },
        { status: 400 }
      );
    }

    const updated = await ServerStore.updateLead(id, updates);
    if (!updated) {
      return NextResponse.json(
        { success: false, error: 'Lead not found.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead updated successfully',
      data: updated,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to update lead' },
      { status: 500 }
    );
  }
}

// DELETE /api/leads - Delete lead
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json(
        { success: false, error: 'Lead ID is required in query params (?id=...)' },
        { status: 400 }
      );
    }

    const deleted = await ServerStore.deleteLead(id);
    if (!deleted) {
      return NextResponse.json(
        { success: false, error: 'Lead not found or already deleted.' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Lead deleted successfully',
      id,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to delete lead' },
      { status: 500 }
    );
  }
}
