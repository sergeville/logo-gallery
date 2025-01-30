import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/lib/auth.config'
import dbConnect from '@/app/lib/db-config'
import { Logo } from '@/app/lib/models/logo'
import { Types } from 'mongoose'
import { use } from 'react'

/**
 * Admin API Endpoint to update voting deadline
 * Only accessible by admin users
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session?.user?.email === process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      )
    }

    const { votingDeadline } = await request.json()
    if (!votingDeadline) {
      return NextResponse.json(
        { error: 'Voting deadline is required' },
        { status: 400 }
      )
    }

    const newDeadline = new Date(votingDeadline)
    if (newDeadline < new Date()) {
      return NextResponse.json(
        { error: 'Voting deadline must be in the future' },
        { status: 400 }
      )
    }

    await dbConnect()
    const logo = await Logo.findByIdAndUpdate(
      params.id,
      { votingDeadline: newDeadline },
      { new: true }
    )

    if (!logo) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Voting deadline updated successfully',
      logo
    })
  } catch (error) {
    console.error('Error updating voting deadline:', error)
    return NextResponse.json(
      { error: 'Failed to update voting deadline' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await dbConnect()
    const logo = await Logo.findById(params.id)

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 })
    }

    const votingDeadline = new Date(logo.createdAt)
    votingDeadline.setDate(votingDeadline.getDate() + 7) // 7 days voting period

    return NextResponse.json({ deadline: votingDeadline.toISOString() })
  } catch (error) {
    console.error('Error fetching voting deadline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting deadline' },
      { status: 500 }
    )
  }
} 