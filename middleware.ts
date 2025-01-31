import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { cacheMiddleware } from '@/middleware/cacheMiddleware'
import { sessionMiddleware } from '@/app/middleware/sessionMiddleware'

export async function middleware(request: NextRequest) {
  // Handle session requests first
  if (request.url.includes('/api/auth/session')) {
    return sessionMiddleware(request)
  }

  const response = NextResponse.next()

  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  )

  return cacheMiddleware(request, response)
}

export const config = {
  matcher: [
    '/api/auth/session',
    '/api/protected/:path*',
    '/api/images/:path*',
    '/api/logos/:path*'
  ],
} 