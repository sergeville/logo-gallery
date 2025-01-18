import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  // Skip middleware for WebSocket connections
  if (request.headers.get('upgrade') === 'websocket') {
    return NextResponse.next()
  }

  const response = NextResponse.next()

  // Add CORS headers
  response.headers.set('Access-Control-Allow-Credentials', 'true')
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET,DELETE,PATCH,POST,PUT')
  response.headers.set(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, RSC'
  )

  // Add RSC-specific headers
  if (request.url.includes('_rsc')) {
    response.headers.set('RSC', '1')
    response.headers.set('Next-Router-State-Tree', '1')
    response.headers.set('Next-Router-Prefetch', '1')
  }

  return response
}

// Match all routes except WebSocket and static files
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|_next/webpack-hmr).*)',
  ],
} 