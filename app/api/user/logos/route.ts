/**
 * User Logos API Route
 * Handles fetching logos specific to the authenticated user.
 * Requires authentication and provides user-specific logo management functionality.
 */

import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { connectToDatabase } from '@/app/lib/db'
import { Logo, ClientLogo } from '@/app/lib/types'
import { ObjectId, WithId } from 'mongodb'

/**
 * Transforms a server-side Logo document into a client-safe format
 * Handles ObjectId conversion, date formatting, and nested object transformation
 * @param doc The raw logo document from MongoDB with WithId type
 * @returns A sanitized ClientLogo object safe for client consumption
 */
function transformLogo(doc: WithId<any>): ClientLogo {
  if (!doc) {
    throw new Error('Invalid logo document')
  }

  const logo = doc as Logo & { _id: ObjectId }
  return {
    id: logo._id?.toString() || '',
    name: logo.name || '',
    description: logo.description || '',
    url: logo.url || '',
    imageUrl: logo.imageUrl || '',
    thumbnailUrl: logo.thumbnailUrl || logo.imageUrl || '',
    userId: logo.userId?.toString() || '',
    ownerName: logo.ownerName || 'Unknown User',
    tags: Array.isArray(logo.tags) ? logo.tags : [],
    totalVotes: logo.totalVotes || 0,
    votes: Array.isArray(logo.votes) 
      ? logo.votes.map(vote => ({
          userId: vote.userId?.toString() || '',
          rating: vote.rating || 0,
          timestamp: vote.timestamp ? new Date(vote.timestamp).toISOString() : new Date().toISOString()
        }))
      : [],
    createdAt: logo.createdAt ? new Date(logo.createdAt).toISOString() : new Date().toISOString(),
    updatedAt: logo.updatedAt ? new Date(logo.updatedAt).toISOString() : new Date().toISOString()
  }
}

/**
 * GET handler for fetching user-specific logos
 * Requires authentication via NextAuth session
 * Returns all logos owned by the authenticated user, sorted by creation date
 */
export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email || !session?.user?.id) {
      console.log('No authenticated user found');
      return new NextResponse(
        JSON.stringify({ error: 'Not authenticated' }),
        { status: 401 }
      )
    }

    const { db } = await connectToDatabase()
    
    // Get the logos with proper error handling
    let logos = []
    try {
      // Ensure we're querying with the correct user ID
      const userId = new ObjectId(session.user.id)
      console.log('Fetching logos for user:', userId.toString());
      
      logos = await db.collection('logos')
        .find({ userId: userId })
        .sort({ createdAt: -1 })
        .toArray()

      console.log(`Found ${logos.length} logos for user ${session.user.id}`);
      
      if (logos.length === 0) {
        console.log('No logos found in database for user');
      } else {
        console.log('First logo found:', JSON.stringify(logos[0], null, 2));
      }
    } catch (error) {
      console.error('Error fetching logos from database:', error)
      throw new Error('Failed to fetch logos from database')
    }

    // Transform logos with error handling
    const clientLogos = logos.map(logo => {
      try {
        return transformLogo(logo)
      } catch (error) {
        console.error('Error transforming logo:', error, logo)
        return null
      }
    }).filter(Boolean) // Remove any null values from failed transformations

    return new NextResponse(
      JSON.stringify({ 
        logos: clientLogos,
        userId: session.user.id
      }),
      { status: 200 }
    )
  } catch (error) {
    console.error('Error in GET /api/user/logos:', error)
    return new NextResponse(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : 'Internal server error',
        details: process.env.NODE_ENV === 'development' ? error : undefined
      }),
      { status: 500 }
    )
  }
} 