/**
 * User Logos API Route
 * Handles fetching logos specific to the authenticated user.
 * Requires authentication and provides user-specific logo management functionality.
 */

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../../auth/[...nextauth]/options'
import connectDB from '@/app/lib/db'
import { Logo } from '@/app/lib/models/logo'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = request.nextUrl
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    await connectDB()

    const [logos, total] = await Promise.all([
      Logo.find({ ownerId: session.user.id })
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Logo.countDocuments({ ownerId: session.user.id })
    ])

    const hasMore = total > skip + logos.length

    return NextResponse.json({
      logos,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore
      }
    })
  } catch (error) {
    console.error('Error fetching user logos:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 