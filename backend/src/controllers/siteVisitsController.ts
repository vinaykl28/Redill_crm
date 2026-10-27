import { Request, Response } from 'express';
import { ServerStore } from '../data/serverStore';

export async function getSiteVisits(req: Request, res: Response) {
  try {
    const { status, lead_id } = req.query;

    const visits = await ServerStore.getSiteVisits(status as string, lead_id as string);

    res.json({
      success: true,
      count: visits.length,
      data: visits,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch site visits' });
  }
}

export async function createSiteVisit(req: Request, res: Response) {
  try {
    const body = req.body;

    if (!body.lead_id) {
      return res.status(400).json({ success: false, error: 'lead_id is required' });
    }

    const createdVisit = await ServerStore.createSiteVisit(body);

    res.status(201).json({
      success: true,
      message: 'Site visit scheduled and dispatch notified',
      data: createdVisit,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to schedule site visit' });
  }
}

export async function updateSiteVisit(req: Request, res: Response) {
  try {
    const id = req.params.id || req.body.id;
    const updates = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Site visit ID is required.' });
    }

    const updated = await ServerStore.updateSiteVisit(id, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Site visit record not found.' });
    }

    res.json({
      success: true,
      message: 'Site visit updated successfully',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update site visit' });
  }
}
