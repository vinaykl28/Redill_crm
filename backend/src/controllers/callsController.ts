import { Request, Response } from 'express';
import { ServerStore } from '../data/serverStore';

export async function getCalls(req: Request, res: Response) {
  try {
    const { lead_id, caller_id } = req.query;

    const calls = await ServerStore.getCalls(lead_id as string, caller_id as string);

    res.json({
      success: true,
      count: calls.length,
      data: calls,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch calls' });
  }
}

export async function createCall(req: Request, res: Response) {
  try {
    const body = req.body;

    if (!body.lead_id) {
      return res.status(400).json({ success: false, error: 'lead_id is required' });
    }

    const createdCall = await ServerStore.createCall(body);

    res.status(201).json({
      success: true,
      message: 'Call log saved',
      data: createdCall,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to log call' });
  }
}
