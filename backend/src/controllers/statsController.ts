import { Request, Response } from 'express';
import { ServerStore } from '../data/serverStore';
import { isSupabaseConfigured } from '../config/db';

export async function getStats(req: Request, res: Response) {
  try {
    const stats = await ServerStore.getStats();

    res.json({
      success: true,
      data: stats,
      supabaseConnected: isSupabaseConfigured(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to calculate stats' });
  }
}

export async function getConnectionStatus(req: Request, res: Response) {
  try {
    const isConfigured = isSupabaseConfigured();
    res.json({
      success: true,
      service: 'Red Hill Infra CRM Express API',
      status: 'online',
      port: process.env.PORT || 5000,
      supabaseConnected: isConfigured,
      timestamp: new Date().toISOString(),
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Connection check failed' });
  }
}
