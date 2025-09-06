import { NextRequest, NextResponse } from 'next/server';
import { readFileSync, existsSync } from 'fs';
import path from 'path';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Validate the ID format (should be a UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(id)) {
      return NextResponse.json({ error: 'Invalid screenshot ID' }, { status: 400 });
    }

    const filename = path.join('/tmp', `screenshot-${id}.png`);

    // Check if file exists
    if (!existsSync(filename)) {
      return NextResponse.json({ error: 'Screenshot not found' }, { status: 404 });
    }

    // Read the file
    const imageBuffer = readFileSync(filename);

    // Return the image with proper headers
    return new NextResponse(imageBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      },
    });
  } catch (error) {
    console.error('Error serving screenshot:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
