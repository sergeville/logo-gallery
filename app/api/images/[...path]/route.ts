import { type NextRequest, NextResponse } from 'next/server';
import { cacheMiddleware } from '@/middleware/cacheMiddleware';
import { use } from 'react';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
): Promise<NextResponse> {
  try {
    const { path } = use(params);
    
    // Create base response
    const response = NextResponse.next();

    // Apply cache middleware
    const cachedResponse = await cacheMiddleware(request, response);
    if (cachedResponse) {
      return Promise.resolve(cachedResponse);
    }

    // For testing purposes, return a sample image
    // In production, this would fetch from your image storage
    return Promise.resolve(new NextResponse(Buffer.from('Sample image data'), {
      headers: {
        'Content-Type': 'image/png',
        'Cache-Control': 'public, max-age=3600',
      },
    }));
  } catch (error) {
    console.error('Error serving image:', error);
    return Promise.resolve(new NextResponse('Internal Server Error', { status: 500 }));
  }
} 