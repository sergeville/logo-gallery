/**
 * Logos API Route
 * Handles fetching and managing logo data with pagination support.
 * This route provides endpoints for retrieving logos with proper client-side data transformation.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import type { AuthOptions } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { connectToDatabase } from '@/app/lib/db';
import { Logo, ClientLogo } from '@/app/lib/types';
import { ObjectId, WithId } from 'mongodb';

interface CreateLogoBody {
  name: string;
  description: string;
  url?: string;
  imageUrl: string;
  tags?: string[];
}

interface PaginationData {
  current: number;
  total: number;
  hasMore: boolean;
}

interface GetLogosResponse {
  logos: ClientLogo[];
  pagination: PaginationData;
}

interface CreateLogoResponse {
  logo: ClientLogo;
}

interface ErrorResponse {
  error: string;
  details?: unknown;
}

/**
 * Transforms a server-side Logo document into a client-safe format
 * Handles ObjectId conversion, date formatting, and nested object transformation
 * @param doc The raw logo document from MongoDB
 * @returns A sanitized ClientLogo object safe for client consumption
 */
function transformLogo(doc: WithId<Logo>): ClientLogo {
  if (!doc) {
    throw new Error('Invalid logo document')
  }

  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description,
    url: doc.url,
    imageUrl: doc.imageUrl,
    thumbnailUrl: doc.thumbnailUrl || doc.imageUrl,
    userId: doc.userId.toString(),
    ownerName: doc.ownerName,
    tags: doc.tags,
    totalVotes: doc.totalVotes,
    votes: doc.votes.map(vote => ({
      userId: vote.userId.toString(),
      rating: vote.rating,
      timestamp: vote.timestamp.toISOString()
    })),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
  }
}

/**
 * GET handler for fetching paginated logos
 * Supports query parameters:
 * - page: Current page number (default: 1)
 * - limit: Number of items per page (fixed at 12)
 * Returns transformed logo data with pagination metadata
 */
export async function GET(request: NextRequest): Promise<Response> {
  try {
    const searchParams = request.nextUrl.searchParams
    const page = parseInt(searchParams.get('page') || '1')
    const limit = 12
    const skip = (page - 1) * limit

    const { db } = await connectToDatabase()
    
    // Get the logos with proper error handling
    let logos: WithId<Logo>[] = []
    try {
      logos = await db.collection<Logo>('logos')
        .find()
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray()
    } catch (error) {
      console.error('Error fetching logos from database:', error)
      throw new Error('Failed to fetch logos from database')
    }

    // Get total count with error handling
    let total = 0
    try {
      total = await db.collection<Logo>('logos').countDocuments()
    } catch (error) {
      console.error('Error counting logos:', error)
      throw new Error('Failed to count total logos')
    }

    const hasMore = skip + logos.length < total

    // Transform logos with error handling
    const clientLogos = logos.map(logo => {
      try {
        return transformLogo(logo)
      } catch (error) {
        console.error('Error transforming logo:', error, logo)
        return null
      }
    }).filter((logo): logo is ClientLogo => logo !== null)

    const response: GetLogosResponse = {
      logos: clientLogos,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore
      }
    }

    return NextResponse.json(response)
  } catch (error) {
    console.error('Error in GET /api/logos:', error)
    const errorResponse: ErrorResponse = { 
      error: error instanceof Error ? error.message : 'Internal server error',
      details: process.env.NODE_ENV === 'development' ? error : undefined
    }
    return NextResponse.json(errorResponse, { status: 500 })
  }
}

export async function POST(request: NextRequest): Promise<Response> {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email || !session?.user?.id) {
      const errorResponse: ErrorResponse = { error: 'Not authenticated' }
      return NextResponse.json(errorResponse, { status: 401 });
    }

    const body = await request.json() as CreateLogoBody;
    const { name, description, url, imageUrl, tags } = body;

    // Basic validation
    if (!name || !description || !imageUrl) {
      const errorResponse: ErrorResponse = { error: 'Missing required fields' }
      return NextResponse.json(errorResponse, { status: 400 });
    }

    const { db } = await connectToDatabase();
    
    const logo: Omit<Logo, '_id'> = {
      name,
      description,
      url: url || '',
      imageUrl,
      thumbnailUrl: imageUrl,
      userId: new ObjectId(session.user.id),
      ownerName: session.user.name || 'Test User',
      tags: tags || [],
      totalVotes: 0,
      votes: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection<Logo>('logos').insertOne(logo);
    const insertedLogo = await db.collection<Logo>('logos').findOne({ _id: result.insertedId });

    if (!insertedLogo) {
      throw new Error('Failed to retrieve inserted logo');
    }

    // Transform to client format
    const clientLogo = transformLogo(insertedLogo);
    const response: CreateLogoResponse = { logo: clientLogo }

    return NextResponse.json(response, { status: 201 });
  } catch (error) {
    console.error('Error creating logo:', error);
    const errorResponse: ErrorResponse = { error: 'Internal server error' }
    return NextResponse.json(errorResponse, { status: 500 });
  }
} 