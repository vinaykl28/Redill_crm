import { Request, Response } from 'express';
import { ServerStore } from '../data/serverStore';

export async function getDocuments(req: Request, res: Response) {
  try {
    const { category, lead_id } = req.query;

    const docs = await ServerStore.getDocuments(category ? String(category) : undefined);

    res.json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to fetch documents' });
  }
}

export async function createDocument(req: Request, res: Response) {
  try {
    const body = req.body;

    if (!body.title) {
      return res.status(400).json({ success: false, error: 'Document title is required' });
    }

    const createdDoc = await ServerStore.createDocument(body);

    res.status(201).json({
      success: true,
      message: 'Document uploaded to Red Hill digital vault',
      data: createdDoc,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: err.message || 'Failed to upload document' });
  }
}
