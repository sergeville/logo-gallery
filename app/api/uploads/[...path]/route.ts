import { NextResponse } from 'next/server';
import { readFile } from 'fs/promises';
import path from 'path';
import { headers } from 'next/headers';

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
  { params }: { params: { path: string[] } }
) {
  try {
    const filePath = path.join(UPLOAD_DIR, ...params.path);
    const ext = path.extname(filePath).slice(1).toLowerCase();
    const contentType = contentTypes[ext] || 'application/octet-stream';

    try {
      const fileBuffer = await readFile(filePath);
      
      const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Content-Length': fileBuffer.length.toString(),
      });

      return new NextResponse(fileBuffer, { headers });
    } catch (error) {
      console.error('Error reading file:', error);
      return new NextResponse('File not found', { status: 404 });
    }
  } catch (error) {
    console.error('Error serving file:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 