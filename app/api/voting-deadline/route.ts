import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/lib/auth.config'
import dbConnect from '@/app/lib/db-config'
import { VotingSettings } from '@/app/lib/models/VotingSettings'

export async function GET() {
  try {
    await dbConnect()
    const settings = await VotingSettings.findOne() || await VotingSettings.create({
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // Default 7 days from now
    })
    return NextResponse.json({ deadline: settings.deadline })
  } catch (error) {
    console.error('Error fetching deadline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch voting deadline' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authConfig)
    if (!session) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // Check if user is admin
    if (session.user?.email !== process.env.NEXT_PUBLIC_ADMIN_EMAIL) {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      )
    }

    const { deadline } = await request.json()
    if (!deadline) {
      return NextResponse.json(
        { error: 'Deadline is required' },
        { status: 400 }
      )
    }

    const newDeadline = new Date(deadline)
    if (newDeadline < new Date()) {
      return NextResponse.json(
        { error: 'Deadline must be in the future' },
        { status: 400 }
      )
    }

    await dbConnect()
    const settings = await VotingSettings.findOneAndUpdate(
      {},
      { deadline: newDeadline },
      { upsert: true, new: true }
    )

    return NextResponse.json({ deadline: settings.deadline })
  } catch (error) {
    console.error('Error updating deadline:', error)
    return NextResponse.json(
      { error: 'Failed to update voting deadline' },
      { status: 500 }
    )
  }
} 