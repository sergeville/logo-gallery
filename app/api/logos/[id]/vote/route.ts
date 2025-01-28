import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import dbConnect from '@/app/lib/db-config'
import { Logo } from '@/app/lib/models/logo'
import { Types } from 'mongoose'

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // 1. Get and validate session
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Connect to database
    await dbConnect()

    // 3. Get and validate the logo ID
    const logoId = await Promise.resolve(params.id)
    if (!logoId || !Types.ObjectId.isValid(logoId)) {
      return NextResponse.json(
        { error: 'Invalid logo ID' },
        { status: 400 }
      )
    }

    // 4. Find the logo first to check conditions
    const existingLogo = await Logo.findById(logoId)
    if (!existingLogo) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      )
    }

    // 5. Check if user is trying to vote for their own logo
    if (existingLogo.userId === session.user.id.toString()) {
      return NextResponse.json(
        { error: 'Cannot vote for your own logo' },
        { status: 400 }
      )
    }

    // 6. Check if user has already voted
    const hasVoted = existingLogo.votes?.some(vote => 
      vote.userId === session.user.id.toString()
    )
    if (hasVoted) {
      return NextResponse.json(
        { error: 'You have already voted for this logo' },
        { status: 400 }
      )
    }

    // 7. Add the vote using findOneAndUpdate to ensure atomicity
    const updatedLogo = await Logo.findOneAndUpdate(
      { _id: new Types.ObjectId(logoId) },
      {
        $push: {
          votes: {
            userId: session.user.id.toString(),
            timestamp: new Date()
          }
        },
        $inc: { totalVotes: 1 }
      },
      {
        new: true, // Return the updated document
        runValidators: true,
        select: '_id title description imageUrl totalVotes'
      }
    ).lean()

    if (!updatedLogo) {
      return NextResponse.json(
        { error: 'Failed to update logo' },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { 
        message: 'Vote submitted successfully',
        logo: {
          _id: updatedLogo._id,
          title: updatedLogo.title,
          description: updatedLogo.description,
          imageUrl: updatedLogo.imageUrl,
          totalVotes: updatedLogo.totalVotes
        }
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Error processing vote:', error)
    return NextResponse.json(
      { error: 'Failed to process vote' },
      { status: 500 }
    )
  }
} 