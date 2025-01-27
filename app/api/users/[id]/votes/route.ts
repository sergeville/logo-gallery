import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../../lib/db'
import { ObjectId } from 'mongodb'
import { Logo } from '../../../../../lib/types'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const userId = params.id

    if (!userId) {
      return NextResponse.json({
        success: false,
        message: 'User ID is required'
      }, { status: 400 })
    }

    const { db } = await connectToDatabase()
    const logosCollection = db.collection<Logo>('logos')

    const userVotes = await logosCollection
      .find({
        'votes.userId': new ObjectId(userId)
      })
      .project({
        _id: 1,
        name: 1,
        description: 1,
        imageUrl: 1,
        thumbnailUrl: 1,
        votes: {
          $filter: {
            input: '$votes',
            as: 'vote',
            cond: { $eq: ['$$vote.userId', new ObjectId(userId)] }
          }
        }
      })
      .toArray()

    return NextResponse.json({
      success: true,
      votes: userVotes
    })
  } catch (error) {
    console.error('Error fetching user votes:', error)
    return NextResponse.json({
      success: false,
      message: 'Error fetching user votes'
    }, { status: 500 })
  }
} 