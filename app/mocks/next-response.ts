import { NextResponse } from 'next/server'

// Mock NextResponse.json
const originalNextResponse = NextResponse
jest.mock('next/server', () => ({
  ...jest.requireActual('next/server'),
  NextResponse: {
    json: (body: any, init?: ResponseInit) => {
      const response = new Response(JSON.stringify(body), {
        ...init,
        headers: {
          'Content-Type': 'application/json',
          ...(init?.headers || {})
        }
      })
      Object.setPrototypeOf(response, originalNextResponse.prototype)
      return response
    }
  }
})) 