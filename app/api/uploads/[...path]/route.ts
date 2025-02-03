import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

const contentTypes: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Validate and sanitize path
    if (!params.path || !Array.isArray(params.path)) {
      return new NextResponse('Invalid path parameter', { status: 400 });
    }

    const sanitizedPath = params.path
      .map(segment => segment.replace(/[^a-zA-Z0-9-_.]/g, ''))
      .join('/');

    // Get image processing options from query parameters
    const url = new URL(request.url);
    const width = url.searchParams.get('w') ? parseInt(url.searchParams.get('w')!) : undefined;
    const height = url.searchParams.get('h') ? parseInt(url.searchParams.get('h')!) : undefined;
    const quality = url.searchParams.get('q') ? parseInt(url.searchParams.get('q')!) : undefined;
    const format = url.searchParams.get('f') as 'jpeg' | 'png' | 'webp' | undefined;

    // Construct the file URL
    const fileUrl = new URL(`/uploads/${sanitizedPath}`, request.url).toString();

    try {
      // Fetch the image
      const imageResponse = await fetch(fileUrl);
      if (!imageResponse.ok) {
        return new NextResponse('Image not found', { status: 404 });
      }

      // Get the image data
      const imageData = await imageResponse.arrayBuffer();

      // Determine content type based on file extension or format parameter
      const ext = format || sanitizedPath.match(/[^.]+$/)?.[0]?.toLowerCase();
      const contentType = contentTypes[ext] || 'application/octet-stream';

      const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': imageData.byteLength.toString(),
      });

      return new NextResponse(imageData, { headers });
    } catch (error) {
      console.error('Error serving file:', error);
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 