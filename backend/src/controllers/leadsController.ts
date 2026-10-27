import { Request, Response } from 'express';
import { ServerStore } from '../data/serverStore';

export async function getLeads(req: Request, res: Response) {
  try {
    const { status, assigned_to, source, search } = req.query;

    const leads = await ServerStore.getLeads({
      status: status as string,
      assigned_to: assigned_to as string,
      source: source as string,
      search: search as string,
    });

    res.json({
      success: true,
      count: leads.length,
      data: leads,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch leads' });
  }
}

export async function createLead(req: Request, res: Response) {
  try {
    const body = req.body;

    if (Array.isArray(body)) {
      const createdLeads = await ServerStore.bulkCreateLeads(body);
      return res.status(201).json({
        success: true,
        message: `${createdLeads.length} leads imported successfully`,
        count: createdLeads.length,
        data: createdLeads,
      });
    }

    if (!body.name || !body.phone) {
      return res.status(400).json({
        success: false,
        error: 'Name and phone number are required fields.',
      });
    }

    const created = await ServerStore.createLead(body);
    return res.status(201).json({
      success: true,
      message: 'Lead created successfully',
      data: created,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to create lead' });
  }
}

export async function updateLead(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const updates = req.body;

    const leadId = id || req.body.id;
    if (!leadId) {
      return res.status(400).json({ success: false, error: 'Lead ID is required.' });
    }

    const updated = await ServerStore.updateLead(leadId, updates);
    if (!updated) {
      return res.status(404).json({ success: false, error: 'Lead not found.' });
    }

    res.json({
      success: true,
      message: 'Lead updated successfully',
      data: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to update lead' });
  }
}

export async function deleteLead(req: Request, res: Response) {
  try {
    const id = (req.params.id || req.query.id) as string;

    if (!id) {
      return res.status(400).json({ success: false, error: 'Lead ID is required.' });
    }

    const deleted = await ServerStore.deleteLead(id);
    if (!deleted) {
      return res.status(404).json({ success: false, error: 'Lead not found or already deleted.' });
    }

    res.json({
      success: true,
      message: 'Lead deleted successfully',
      id,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to delete lead' });
  }
}
