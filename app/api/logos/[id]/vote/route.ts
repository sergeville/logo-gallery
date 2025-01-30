import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authConfig } from '@/app/lib/auth.config'
import dbConnect from '@/app/lib/db-config'
import { Logo } from '@/app/lib/models/logo'
import { Types } from 'mongoose'
import { use } from 'react'

/**
 * Vote API Endpoint
 * 
 * Handles voting for logos with the following rules:
 * 1. Users can only have one active vote at a time
 * 2. Users cannot vote for their own logos
 * 3. Users can change their vote to a different logo
 * 
 * The voting process:
 * 1. Validates user authentication
 * 2. Checks if the logo exists
 * 3. Prevents voting for own logos
 * 4. Checks for existing vote on this logo
 * 5. Removes any previous vote on other logos
 * 6. Records the new vote
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = use(params)

    // 1. Get and validate session - Users must be logged in to vote
    const session = await getServerSession(authConfig)
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // 2. Connect to database
    await dbConnect()

    // 3. Get and validate the logo ID
    if (!id || !Types.ObjectId.isValid(id)) {
      return NextResponse.json(
        { error: 'Invalid logo ID' },
        { status: 400 }
      )
    }

    // 4. Find the logo and validate its existence
    const existingLogo = await Logo.findById(id)
    if (!existingLogo) {
      return NextResponse.json(
        { error: 'Logo not found' },
        { status: 404 }
      )
    }

    // 5. Check if voting deadline has passed
    if (new Date() > new Date(existingLogo.votingDeadline)) {
      return NextResponse.json(
        { error: 'Voting period has ended for this logo' },
        { status: 400 }
      )
    }

    // 6. Prevent users from voting for their own logos
    if (existingLogo.userId === session.user.id.toString()) {
      return NextResponse.json(
        { error: 'Cannot vote for your own logo' },
        { status: 400 }
      )
    }

    // 7. Prevent duplicate votes on the same logo
    const hasVotedThis = await Logo.findOne({
      _id: new Types.ObjectId(id),
      'votes.userId': session.user.id.toString()
    })
    
    if (hasVotedThis) {
      return NextResponse.json(
        { error: 'You have already voted for this logo' },
        { status: 400 }
      )
    }

    // 8. Find and remove any previous vote on other logos
    const previousVote = await Logo.findOne({
      'votes.userId': session.user.id.toString()
    })

    if (previousVote) {
      // Remove the previous vote and decrement the vote count
      await Logo.findByIdAndUpdate(previousVote._id, {
        $pull: { votes: { userId: session.user.id.toString() } },
        $inc: { totalVotes: -1 }
      })
    }

    // 9. Add the new vote and increment the vote count
    const updatedLogo = await Logo.findOneAndUpdate(
      { _id: new Types.ObjectId(id) },
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
        select: '_id title description imageUrl totalVotes votes'
      }
    ).lean()

    if (!updatedLogo) {
      return NextResponse.json(
        { error: 'Failed to update logo' },
        { status: 500 }
      )
    }

    // Return the updated logo information
    return NextResponse.json(
      { 
        message: 'Vote submitted successfully',
        logo: {
          _id: updatedLogo._id,
          title: updatedLogo.title,
          description: updatedLogo.description,
          imageUrl: updatedLogo.imageUrl,
          totalVotes: updatedLogo.votes.length
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