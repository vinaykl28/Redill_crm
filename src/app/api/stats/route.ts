import { NextResponse } from 'next/server';
import { ServerStore } from '@/lib/serverStore';

// GET /api/stats - Performance analytics & funnel metrics
export async function GET() {
  try {
    const stats = await ServerStore.getStats();

    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      data: stats,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to compute stats' },
      { status: 500 }
    );
  }
}
