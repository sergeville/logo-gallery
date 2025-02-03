import { NextRequest, NextResponse } from 'next/server';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/app/lib/db-config';

// Configure route to use Node.js runtime
export const dynamic = 'force-dynamic';

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
const CACHE_CONTROL = 'public, max-age=3600, stale-while-revalidate=86400'; // 1 hour + 24h stale
const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'Referrer-Policy': 'strict-origin-when-cross-origin'
};

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params;
    
    // Validate ObjectId
    if (!ObjectId.isValid(id)) {
      return new NextResponse('Invalid logo ID', { status: 400 });
    }

    // Connect to database
    const { db } = await connectToDatabase();
    const logo = await db.collection('logos').findOne({ _id: new ObjectId(id) });

    if (!logo) {
      return new NextResponse('Logo not found', { status: 404 });
    }

    // Fetch image from URL
    const imageResponse = await fetch(logo.imageUrl);
    if (!imageResponse.ok) {
      return new NextResponse('Error fetching image', { status: 502 });
    }

    const contentType = imageResponse.headers.get('content-type') || 'image/png';
    const imageArrayBuffer = await imageResponse.arrayBuffer();

    return new NextResponse(imageArrayBuffer, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': CACHE_CONTROL,
        ...SECURITY_HEADERS
      }
    });
  } catch (error) {
    console.error('Error serving logo image:', error);
    return new NextResponse('Error serving image', { status: 500 });
  }
} 