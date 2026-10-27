import { NextRequest, NextResponse } from 'next/server';
import { isSupabaseConfigured } from '@/lib/supabaseClient';
import { serverState } from '@/lib/serverStore';
import { createClient } from '@supabase/supabase-js';

// GET /api/connection - Health and Gateway Status
export async function GET() {
  const startTime = Date.now();
  const supabaseActive = isSupabaseConfigured();
  const latency = Date.now() - startTime;

  const currentUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const maskedUrl = currentUrl.includes('supabase.co')
    ? currentUrl.replace(/https:\/\/(.*?)\.supabase\.co.*/, 'https://$1.supabase.co')
    : currentUrl;

  return NextResponse.json({
    success: true,
    status: 'connected',
    server: 'Next.js App Router (Localhost)',
    timestamp: new Date().toISOString(),
    latencyMs: latency,
    database: {
      type: supabaseActive ? 'Supabase PostgreSQL' : 'Local In-Memory & Storage Cache Engine',
      mode: supabaseActive ? 'production_live' : 'interactive_local_api',
      isSupabaseActive: supabaseActive,
      configuredUrl: maskedUrl || 'Not configured (using local REST API)',
      tables: {
        leads: serverState.leads.length,
        calls: serverState.calls.length,
        site_visits: serverState.siteVisits.length,
        documents: serverState.documents.length,
        profiles: serverState.profiles.length,
      },
    },
    endpoints: [
      { method: 'GET', path: '/api/leads', desc: 'List leads with filters' },
      { method: 'POST', path: '/api/leads', desc: 'Create new lead' },
      { method: 'PATCH', path: '/api/leads', desc: 'Update lead status or details' },
      { method: 'DELETE', path: '/api/leads?id=...', desc: 'Delete lead' },
      { method: 'GET', path: '/api/calls', desc: 'List telecaller call records' },
      { method: 'POST', path: '/api/calls', desc: 'Log new phone call' },
      { method: 'GET', path: '/api/site-visits', desc: 'List scheduled site visits' },
      { method: 'POST', path: '/api/site-visits', desc: 'Dispatch & schedule visit' },
      { method: 'GET', path: '/api/documents', desc: 'List CRM brochures & vaults' },
      { method: 'GET', path: '/api/stats', desc: 'Funnel analytics & conversion metrics' },
    ],
  });
}

// POST /api/connection - Test Supabase credentials
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { supabaseUrl, supabaseAnonKey } = body;

    if (!supabaseUrl || !supabaseAnonKey) {
      return NextResponse.json(
        { success: false, error: 'Both Supabase URL and Anon Key are required for verification.' },
        { status: 400 }
      );
    }

    const tStart = Date.now();
    const client = createClient(supabaseUrl, supabaseAnonKey);
    const { error, count } = await client
      .from('leads')
      .select('*', { count: 'exact', head: true });

    const pingMs = Date.now() - tStart;

    if (error) {
      return NextResponse.json({
        success: false,
        error: `Supabase responded with: ${error.message} (code: ${error.code})`,
        hint: 'Please ensure the table "leads" exists by running supabase/schema.sql in Supabase SQL Editor.',
        pingMs,
      });
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully connected to Supabase Database!',
      pingMs,
      existingLeadsInDatabase: count ?? 0,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Connection test failed' },
      { status: 500 }
    );
  }
}
