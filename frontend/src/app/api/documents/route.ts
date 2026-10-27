import { NextRequest, NextResponse } from 'next/server';
import { ServerStore } from '@/lib/serverStore';

// GET /api/documents - List documents
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category') || undefined;

    const docs = await ServerStore.getDocuments(category);

    return NextResponse.json({
      success: true,
      count: docs.length,
      data: docs,
    });
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

// POST /api/documents - Upload / register document
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    if (!body.title) {
      return NextResponse.json(
        { success: false, error: 'Document title is required.' },
        { status: 400 }
      );
    }

    const createdDoc = await ServerStore.createDocument(body);

    return NextResponse.json(
      {
        success: true,
        message: 'Document cataloged in Red Hill Vault',
        data: createdDoc,
      },
      { status: 201 }
    );
  } catch (error: unknown) {
    const err = error as Error;
    return NextResponse.json(
      { success: false, error: err.message || 'Failed to upload document' },
      { status: 500 }
    );
  }
}
