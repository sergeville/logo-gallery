import { NextRequest, NextResponse } from 'next/server';
import { Logo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import { isValidObjectId } from 'mongoose';
import { imageCacheService } from '@/app/lib/services/ImageCacheService';
import { use } from 'react';

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
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = use(params);
    if (!isValidObjectId(id)) {
      return new NextResponse('Invalid logo ID', { status: 400 });
    }

    await dbConnect();
    const logo = await Logo.findById(id);

    if (!logo) {
      return new NextResponse('Logo not found', { status: 404 });
    }

    // Check cache first
    const cachedImage = await imageCacheService.getImage(logo.imageUrl);
    if (cachedImage) {
      return new NextResponse(cachedImage.buffer, {
        headers: {
          'Content-Type': cachedImage.contentType,
          'Cache-Control': 'public, max-age=3600',
          'x-cache': 'HIT'
        }
      });
    }

    // If not in cache, fetch from URL
    const imageResponse = await fetch(logo.imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();

    // Cache the image
    await imageCacheService.getImage(logo.imageUrl, {
      buffer: Buffer.from(imageBuffer),
      contentType: 'image/png'
    });

    return new NextResponse(imageBuffer, {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
        'x-cache': 'MISS'
      }
    });
  } catch (error) {
    console.error('Error serving logo image:', error);
    return new NextResponse('Error serving image', { status: 500 });
  }
} 