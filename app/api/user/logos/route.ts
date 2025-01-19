/**
 * User Logos API Route
 * Handles fetching logos specific to the authenticated user.
 * Requires authentication and provides user-specific logo management functionality.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/db'
import { Logo } from '@/app/models/Logo'
import { ClientLogo, transformLogo } from '@/app/lib/transforms'
import { ObjectId, Document, WithId } from 'mongodb'

interface GetUserLogosResponse {
  logos: ClientLogo[]
}

interface ErrorResponse {
  error: string
  details?: unknown
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' } satisfies ErrorResponse, { status: 401 })
    }

    const { db } = await connectToDatabase()
    const logos = await db.collection<Logo>('logos')
      .find({ ownerId: new ObjectId(session.user.id) })
      .sort({ createdAt: -1 })
      .toArray() as WithId<Logo>[]

    return NextResponse.json({
      logos: logos.map(logo => transformLogo(logo))
    } satisfies GetUserLogosResponse)

  } catch (error) {
    console.error('Error fetching user logos:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user logos',
      details: error instanceof Error ? error.message : undefined
    } satisfies ErrorResponse, { 
      status: 500 
    })
  }
} 