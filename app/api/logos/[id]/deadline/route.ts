import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/app/lib/db-config'
import { Logo } from '@/app/lib/models/logo'
import { Types } from 'mongoose'

/**
 * Admin API Endpoint to update voting deadline
 * Only accessible by admin users
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id || !session?.user?.isAdmin) {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 401 }
      )
    }

    // 2. Connect to database
    await dbConnect()

    // 3. Get and validate the logo ID
    const logoId = params.id
    if (!logoId || !Types.ObjectId.isValid(logoId)) {
      return NextResponse.json(
        { error: 'Invalid logo ID' },
        { status: 400 }
      )
    }

    // 4. Get the new deadline from request body
    const { votingDeadline } = await request.json()
    if (!votingDeadline) {
      return NextResponse.json(
        { error: 'Voting deadline is required' },
        { status: 400 }
      )
    }

    // 5. Validate the new deadline is in the future
    const newDeadline = new Date(votingDeadline)
    if (newDeadline < new Date()) {
      return NextResponse.json(
        { error: 'Voting deadline must be in the future' },
        { status: 400 }
      )
    }

    // 6. Update the logo's voting deadline
    const updatedLogo = await Logo.findByIdAndUpdate(
      logoId,
      { votingDeadline: newDeadline },
      {
        new: true,
        runValidators: true,
        select: '_id title votingDeadline'
      }
    ).lean()

    if (!updatedLogo) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      message: 'Voting deadline updated successfully',
      logo: updatedLogo
    })
  } catch (error) {
    console.error('Error updating voting deadline:', error)
    return NextResponse.json(
      { error: 'Failed to update voting deadline' },
      { status: 500 }
    )
  }
} 