import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: { path: string[] } }
) {
  try {
    // Validate params
    const pathSegments = await Promise.resolve(params.path);
    if (!pathSegments || !Array.isArray(pathSegments)) {
      return new NextResponse('Invalid path parameter', { status: 400 });
    }

    // Sanitize path to prevent directory traversal
    const sanitizedPath = pathSegments.map(segment => 
      segment.replace(/[^a-zA-Z0-9-_.]/g, '')
    );

    // Construct the file path
    const filePath = path.join(process.cwd(), 'public', 'logos', ...sanitizedPath);

    try {
      // Check if file exists and read it
      const fileBuffer = await fs.readFile(filePath);
      
      // Determine content type based on file extension
      const ext = path.extname(filePath).toLowerCase();
      const contentType = {
        '.png': 'image/png',
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.gif': 'image/gif',
        '.svg': 'image/svg+xml',
        '.webp': 'image/webp',
      }[ext] || 'application/octet-stream';

      // Return the image with proper headers
      return new NextResponse(fileBuffer, {
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