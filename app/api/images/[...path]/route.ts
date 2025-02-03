import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.webp': 'image/webp',
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Validate params
    if (!params.path || !Array.isArray(params.path)) {
      return new NextResponse('Invalid path parameter', { status: 400 });
    }

    // Sanitize path to prevent directory traversal
    const sanitizedPath = params.path.map(segment => 
      segment.replace(/[^a-zA-Z0-9-_.]/g, '')
    ).join('/');

    // Construct the file URL
    const fileUrl = new URL(`/logos/${sanitizedPath}`, request.url).toString();

    try {
      // Fetch the image
      const imageResponse = await fetch(fileUrl);
      if (!imageResponse.ok) {
        return new NextResponse('Image not found', { status: 404 });
      }

      // Determine content type based on file extension
      const ext = sanitizedPath.match(/\.[^.]+$/)?.[0]?.toLowerCase() || '';
      const contentType = contentTypes[ext] || 'application/octet-stream';

      // Get the image data
      const imageData = await imageResponse.arrayBuffer();

      // Return the image with proper headers
      return new NextResponse(imageData, {
        headers: {
          'Content-Type': contentType,
          'Cache-Control': 'public, max-age=31536000, immutable',
        },
      });
    } catch (error) {
      console.error('Error reading image file:', error);
      return new NextResponse('Image not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error processing image request:', error);
    return new NextResponse('Internal server error', { status: 500 });
  }
} 