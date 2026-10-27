import { NextRequest, NextResponse } from 'next/server';
import { ServerStore } from '@/lib/serverStore';

// GET /api/calls - List call logs
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lead_id = searchParams.get('lead_id') || undefined;
    const caller_id = searchParams.get('caller_id') || undefined;

    const calls = await ServerStore.getCalls(lead_id, caller_id);

    return NextResponse.json({
      success: true,
      count: calls.length,
      data: calls,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch call logs' },
      { status: 500 }
    );
  }
}

// POST /api/calls - Record new call log
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.lead_id) {
      return NextResponse.json(
        { success: false, error: 'lead_id is required' },
        { status: 400 }
      );
    }

    const createdCall = await ServerStore.createCall(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Call log saved and synced',
        data: createdCall,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to record call' },
      { status: 500 }
    );
  }
}
