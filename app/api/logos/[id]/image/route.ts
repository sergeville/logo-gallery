import { NextResponse } from 'next/server';
import { Logo, ILogo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import { readFile } from 'fs/promises';
import path from 'path';
import { isValidObjectId } from 'mongoose';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';

const contentTypes: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml'
};

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Processing image request for logo ID:', params.id);

  try {
    // Validate MongoDB ID format
    const logoId = await Promise.resolve(params.id);
    if (!isValidObjectId(logoId)) {
      console.warn('Invalid logo ID format:', logoId);
      return new NextResponse('Invalid logo ID format', { status: 400 });
    }

    try {
      console.log('Connecting to database...');
      await dbConnect();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return new NextResponse('Database connection error', { status: 503 });
    }

    let logo;
    try {
      console.log('Querying database for logo...');
      logo = await Logo.findById(logoId).select('imageUrl').lean<Pick<ILogo, '_id' | 'imageUrl'>>();
      console.log('Database query completed:', { found: !!logo });
    } catch (error) {
      console.error('Error querying logo:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return new NextResponse('Error querying database', { status: 500 });
    }

    if (!logo) {
      console.warn('Logo not found:', logoId);
      return new NextResponse('Logo not found', { status: 404 });
    }

    if (!logo.imageUrl) {
      console.error('Logo found but imageUrl is missing:', { logoId });
      return new NextResponse('Image URL not found', { status: 404 });
    }

    // Handle both local and external URLs
    if (logo.imageUrl.startsWith('http')) {
      return NextResponse.redirect(logo.imageUrl);
    }

    const imagePath = path.join(process.cwd(), 'public', logo.imageUrl);
    console.log('Resolved image path:', imagePath);

    const ext = path.extname(imagePath).slice(1).toLowerCase();
    console.log('File extension:', ext);

    // Validate file extension
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      console.warn('Invalid image format:', { extension: ext, path: imagePath });
      return new NextResponse('Invalid image format', { status: 400 });
    }

    const contentType = contentTypes[ext];
    if (!contentType) {
      console.warn('Unsupported image format:', { extension: ext, path: imagePath });
      return new NextResponse('Unsupported image format', { status: 400 });
    }

    // Get image processing options from query parameters
    const url = new URL(request.url);
    const width = url.searchParams.get('w') ? parseInt(url.searchParams.get('w')!) : undefined;
    const height = url.searchParams.get('h') ? parseInt(url.searchParams.get('h')!) : undefined;
    const quality = url.searchParams.get('q') ? parseInt(url.searchParams.get('q')!) : undefined;
    const format = url.searchParams.get('f') as 'jpeg' | 'png' | 'webp' | undefined;

    try {
      console.log('Getting image from cache or processing...');
      const result = await imageCacheService.getImage(imagePath, {
        width,
        height,
        quality,
        format
      });

      if (!result) {
        console.error('Failed to process or retrieve image:', { path: imagePath });
        return new NextResponse('Error processing image', { status: 500 });
      }

      const headers = new Headers({
        'Content-Type': result.contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': result.buffer.length.toString()
      });

      return new NextResponse(result.buffer, { headers });
    } catch (error) {
      console.error('Error serving image:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: imagePath
      });
      return new NextResponse('Error serving image', { status: 500 });
    }
  } catch (error) {
    console.error('Unhandled error serving logo image:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      logoId: params.id
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 