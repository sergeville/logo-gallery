import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { sessionCacheService } from '@/app/lib/services/cache/SessionCacheService';

export async function sessionMiddleware(request: NextRequest) {
  // Only handle session requests
  if (!request.url.includes('/api/auth/session')) {
    return NextResponse.next();
  }

  try {
    // Extract session token from cookie
    const sessionToken = request.cookies.get('next-auth.session-token')?.value;
    if (!sessionToken) {
      return NextResponse.next();
    }

    // Try to get session from cache
    const cachedSession = await sessionCacheService.getSession(sessionToken);
    if (cachedSession) {
      return NextResponse.json(cachedSession, {
        headers: {
          'Cache-Control': 'private, max-age=300',
          'X-Session-Cache': 'HIT',
        },
      });
    }

    // If not in cache, let the request continue
    const response = await NextResponse.next();
    
    // Cache the response for future requests
    try {
      const session = await response.clone().json();
      await sessionCacheService.setSession(sessionToken, session);
    } catch (error) {
      console.error('Error caching session:', error);
    }

    return response;
  } catch (error) {
    console.error('Session middleware error:', error);
    return NextResponse.next();
  }
} 