import { NextRequest, NextResponse } from 'next/server';
import { cacheMiddleware } from '@/middleware/cacheMiddleware';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/app/lib/auth.config';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return new NextResponse(
        JSON.stringify({ error: 'Authentication required' }),
        { 
          status: 401,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Create initial response
    const response = new NextResponse();

    // Apply cache middleware
    const cachedResponse = await cacheMiddleware(request, response);
    if (cachedResponse) {
      return cachedResponse;
    }

    // Add middleware headers for testing
    const headers = new Headers();
    headers.set('x-middleware-cache', 'active');
    headers.set('x-middleware-auth', 'active');

    return new NextResponse(
      JSON.stringify({ status: 'ok', user: session.user }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'private, max-age=0',
        },
      }
    );
  } catch (error) {
    console.error('Protected resource error:', error);
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { 
        status: 500,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
} 