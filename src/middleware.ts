import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { cacheMiddleware } from '@/middleware/cacheMiddleware';

export async function middleware(request: NextRequest) {
  // Create a response first
  const response = NextResponse.next();

  // Apply caching middleware
  return cacheMiddleware(request, response);
}

export const config = {
  // Configure paths that should be processed by this middleware
  matcher: [
    // API routes that should be cached
    '/api/logos/:path*',
    '/api/stats/:path*',
    // Add more paths as needed
  ],
}; 