/**
 * User Logos API Route
 * Handles fetching logos specific to the authenticated user.
 * Requires authentication and provides user-specific logo management functionality.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/options'
import { connectToDatabase } from '../../../../lib/db'
import { Logo, ClientLogo } from '../../../../lib/types'
import { transformLogo } from '../../../../lib/transforms'
import { ObjectId } from 'mongodb'

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
    if (!session?.user?.id || !session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { db } = await connectToDatabase()
    
    // Query logos using both ObjectId and email to catch any logos that might have been created with either
    const logos = await db.collection<Logo>('logos')
      .find({
        $or: [
          { ownerId: new ObjectId(session.user.id) },
          { ownerName: session.user.email }
        ]
      })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json({
      logos: logos.map(logo => transformLogo(logo))
    })

  } catch (error) {
    console.error('Error fetching user logos:', error)
    return NextResponse.json({ 
      error: 'Failed to fetch user logos',
      details: error instanceof Error ? error.message : undefined
    }, { 
      status: 500 
    })
  }
} 