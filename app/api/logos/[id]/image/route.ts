import { NextResponse } from 'next/server';
import { Logo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import { readFile } from 'fs/promises';
import path from 'path';
import { isValidObjectId } from 'mongoose';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';

// Configure route to run at the edge
export const runtime = 'edge';
export const preferredRegion = 'auto';
export const dynamic = 'force-dynamic'; // Ensure dynamic processing of query parameters

const contentTypes: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp',
  'svg': 'image/svg+xml'
};

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp', 'svg']);

// Cache configuration
const CACHE_CONTROL_IMMUTABLE = 'public, max-age=31536000, immutable, stale-while-revalidate=86400'; // 1 year + 24h stale
const CACHE_CONTROL_REVALIDATE = 'public, max-age=3600, stale-while-revalidate=86400, must-revalidate'; // 1 hour + 24h stale
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

// Image processing constraints
const MAX_DIMENSION = 2048;
const MIN_DIMENSION = 16;
const MAX_QUALITY = 100;
const MIN_QUALITY = 1;

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const logoId = params.id;

    if (!isValidObjectId(logoId)) {
      return new NextResponse('Invalid logo ID', { 
        status: 400,
        headers: SECURITY_HEADERS
      });
    }

    await dbConnect();
    const logo = await Logo.findById(logoId).lean();

    if (!logo) {
      return new NextResponse('Logo not found', { 
        status: 404,
        headers: SECURITY_HEADERS
      });
    }

    if (!logo.imageUrl) {
      return new NextResponse('Image URL not found', { 
        status: 404,
        headers: SECURITY_HEADERS
      });
    }

    // Handle external URLs by redirecting with caching headers
    if (logo.imageUrl.startsWith('http')) {
      const headers = {
        ...SECURITY_HEADERS,
        'Cache-Control': CACHE_CONTROL_REVALIDATE
      };
      return NextResponse.redirect(logo.imageUrl, { headers });
    }

    const imagePath = path.join(process.cwd(), 'public', logo.imageUrl);
    const ext = path.extname(imagePath).slice(1).toLowerCase();

    if (!ALLOWED_EXTENSIONS.has(ext)) {
      return new NextResponse('Invalid image format', { 
        status: 400,
        headers: SECURITY_HEADERS
      });
    }

    const contentType = contentTypes[ext];
    if (!contentType) {
      return new NextResponse('Unsupported image format', { 
        status: 400,
        headers: SECURITY_HEADERS
      });
    }

    // Get and validate image processing options
    const url = new URL(request.url);
    let width = url.searchParams.get('w') ? parseInt(url.searchParams.get('w')!) : undefined;
    let height = url.searchParams.get('h') ? parseInt(url.searchParams.get('h')!) : undefined;
    let quality = url.searchParams.get('q') ? parseInt(url.searchParams.get('q')!) : undefined;
    const format = url.searchParams.get('f') as 'jpeg' | 'png' | 'webp' | undefined;

    // Validate and constrain dimensions
    if (width) {
      width = Math.min(Math.max(width, MIN_DIMENSION), MAX_DIMENSION);
    }
    if (height) {
      height = Math.min(Math.max(height, MIN_DIMENSION), MAX_DIMENSION);
    }
    if (quality) {
      quality = Math.min(Math.max(quality, MIN_QUALITY), MAX_QUALITY);
    }

    // Generate a cache key based on the normalized image path and processing options
    const cacheKey = `${imagePath}?w=${width}&h=${height}&q=${quality}&f=${format}`;

    // Try to get the image from cache first
    const cachedImage = await imageCacheService.getImage(imagePath, {
      width,
      height,
      quality,
      format
    });

    if (cachedImage) {
      const headers = {
        ...SECURITY_HEADERS,
        'Content-Type': cachedImage.contentType,
        'Cache-Control': CACHE_CONTROL_IMMUTABLE,
        'Content-Length': cachedImage.buffer.length.toString(),
        'ETag': `"${Buffer.from(cacheKey).toString('base64')}"`,
        'Vary': 'Accept, Accept-Encoding',
        'Accept-Ranges': 'bytes',
        'Last-Modified': new Date().toUTCString()
      };

      return new NextResponse(cachedImage.buffer, { headers });
    }

    // If not in cache, read and process the image
    const imageBuffer = await readFile(imagePath);
    const processedImage = await imageCacheService.getImage(imagePath, {
      width,
      height,
      quality,
      format
    });

    if (!processedImage) {
      return new NextResponse('Failed to process image', { 
        status: 500,
        headers: SECURITY_HEADERS
      });
    }

    const headers = {
      ...SECURITY_HEADERS,
      'Content-Type': processedImage.contentType,
      'Cache-Control': CACHE_CONTROL_IMMUTABLE,
      'Content-Length': processedImage.buffer.length.toString(),
      'ETag': `"${Buffer.from(cacheKey).toString('base64')}"`,
      'Vary': 'Accept, Accept-Encoding',
      'Accept-Ranges': 'bytes',
      'Last-Modified': new Date().toUTCString()
    };

    return new NextResponse(processedImage.buffer, { headers });
  } catch (error) {
    console.error('Error serving image:', error);
    return new NextResponse('Internal Server Error', { 
      status: 500,
      headers: SECURITY_HEADERS
    });
  }
} 