import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/route'
import { connectToDatabase } from '@/lib/db'
import { VotingSettings } from '@/models/VotingSettings'

export async function GET() {
  try {
    await connectToDatabase()
    const settings = await VotingSettings.getInstance()
    return NextResponse.json({ deadline: settings.deadline })
  } catch (error) {
    console.error('Error fetching deadline:', error)
    return NextResponse.json(
      { error: 'Failed to fetch deadline' },
      { status: 500 }
    )
  }
}

export async function PUT(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
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

    // Get and validate the new deadline
    const { deadline } = await request.json()
    if (!deadline) {
      return NextResponse.json(
        { error: 'Deadline is required' },
        { status: 400 }
      )
    }

    // Validate deadline format
    const deadlineDate = new Date(deadline)
    if (isNaN(deadlineDate.getTime())) {
      return NextResponse.json(
        { error: 'Invalid deadline format' },
        { status: 400 }
      )
    }

    // Connect to database and update settings
    await connectToDatabase()
    const settings = await VotingSettings.getInstance()
    settings.deadline = deadlineDate
    await settings.save()

    return NextResponse.json(
      { message: 'Deadline updated successfully', deadline: settings.deadline },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error updating deadline:', error)
    return NextResponse.json(
      { error: 'Failed to update deadline' },
      { status: 500 }
    )
  }
} 