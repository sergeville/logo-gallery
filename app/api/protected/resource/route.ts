import { NextRequest, NextResponse } from 'next/server';
import { cacheMiddleware } from '@/middleware/cacheMiddleware';

export async function GET(request: NextRequest) {
  const response = NextResponse.next();

  // Apply cache middleware
  const cachedResponse = await cacheMiddleware(request, response);
  if (cachedResponse) {
    return cachedResponse;
  }

  // Add middleware headers for testing
  const headers = new Headers();
  headers.set('x-middleware-cache', 'active');
  headers.set('x-middleware-auth', 'active');

  return new NextResponse(JSON.stringify({ status: 'ok' }), {
    headers: headers,
  });
} 