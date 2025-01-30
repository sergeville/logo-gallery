import { NextRequest, NextResponse } from 'next/server';
import { cacheMiddleware } from '@/middleware/cacheMiddleware';

const sampleImages = [
  { id: '1', name: 'Company A', url: 'https://example.com/logos/company-a.png' },
  { id: '2', name: 'Company B', url: 'https://example.com/logos/company-b.png' },
  { id: '3', name: 'Company C', url: 'https://example.com/logos/company-c.png' },
];

export async function GET(request: NextRequest) {
  const response = NextResponse.next();
  
  // Apply cache middleware
  const cachedResponse = await cacheMiddleware(request, response);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Add cache headers
  const headers = new Headers();
  headers.set('Cache-Control', 'public, max-age=3600');
  headers.set('x-middleware-cache', 'active');

  return NextResponse.json({ data: sampleImages }, { headers });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, url } = body.data;

    if (typeof name !== 'string' || typeof url !== 'string') {
      return NextResponse.json(
        { error: 'Invalid data format' },
        { status: 400 }
      );
    }

    // Simulate saving the image
    const newImage = {
      id: String(sampleImages.length + 1),
      name,
      url
    };

    return NextResponse.json({ data: newImage }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Invalid JSON' },
      { status: 400 }
    );
  }
} 