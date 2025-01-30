import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';
import { use } from 'react';

const UPLOAD_DIR = path.join(process.cwd(), 'public', 'uploads');

const contentTypes: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml'
};

export async function GET(
  request: Request,
  { params }: { params: Promise<{ path: string[] }> }
) {
  try {
    const { path: pathArray } = use(params);
    const filePath = path.join(UPLOAD_DIR, pathArray.join('/'));
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    // Get image processing options from query parameters
    const url = new URL(request.url);
    const width = url.searchParams.get('w') ? parseInt(url.searchParams.get('w')!) : undefined;
    const height = url.searchParams.get('h') ? parseInt(url.searchParams.get('h')!) : undefined;
    const quality = url.searchParams.get('q') ? parseInt(url.searchParams.get('q')!) : undefined;
    const format = url.searchParams.get('f') as 'jpeg' | 'png' | 'webp' | undefined;

    try {
      const result = await imageCacheService.getImage(filePath, {
        width,
        height,
        quality,
        format
      });

      if (!result) {
        console.error('Failed to process or retrieve image:', { path: filePath });
        return new NextResponse('Error processing image', { status: 500 });
      }

      const headers = new Headers({
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': result.buffer.length.toString(),
      });

      return new NextResponse(result.buffer, { headers });
    } catch (error) {
      console.error('Error serving file:', error);
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 