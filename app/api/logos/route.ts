/**
 * Logos API Route
 * Handles fetching and managing logo data with pagination support.
 * This route provides endpoints for retrieving logos with proper client-side data transformation.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { connectToDatabase } from '../../../lib/db';
import { ClientLogo, Logo } from '../../../lib/types';
import { transformLogo } from '../../../lib/transforms';
import { ObjectId, WithId } from 'mongodb';

interface CreateLogoBody {
  name: string;
  description: string;
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const userId = searchParams.get('userId');
    const limit = 12;
    const skip = (page - 1) * limit;

    const { db } = await connectToDatabase();
    
    // Build query based on userId if provided
    const query = userId ? { userId: new ObjectId(userId) } : {};
    
    const [logos, total] = await Promise.all([
      db.collection<Logo>('logos')
        .find(query)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      db.collection<Logo>('logos').countDocuments(query)
    ]);

    const hasMore = total > skip + logos.length;
    const clientLogos = logos.map(transformLogo);

    return NextResponse.json({
      logos: clientLogos,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore
      }
    });
  } catch (error) {
    console.error('Error in GET /api/logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logos' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' } satisfies ErrorResponse, { status: 401 });
    }

    const body = await request.json() as CreateLogoBody;
    if (!body.name || !body.imageUrl) {
      return NextResponse.json({ error: 'Missing required fields' } satisfies ErrorResponse, { status: 400 });
    }

    // Ensure URL has correct format
    const imageUrl = body.imageUrl.startsWith('/uploads/') 
      ? body.imageUrl 
      : `/uploads/${body.imageUrl.split('/').pop()}`;

    const { db } = await connectToDatabase();
    const collection = db.collection<Logo>('logos');

    const logo: Logo = {
      _id: new ObjectId(),
      name: body.name,
      description: body.description,
      imageUrl,
      thumbnailUrl: imageUrl, // TODO: Generate thumbnail
      userId: new ObjectId(session.user.id),
      ownerName: session.user.name || 'Unknown User',
      category: 'uncategorized', // TODO: Add category support
      dimensions: { width: 0, height: 0 }, // TODO: Extract from image
      fileSize: 0, // TODO: Get file size
      fileType: imageUrl.split('.').pop() || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      averageRating: 0,
      totalVotes: 0,
      tags: body.tags || [],
      votes: []
    };

    await collection.insertOne(logo);
    
    return NextResponse.json({
      logo: transformLogo(logo as WithId<Logo>)
    } satisfies CreateLogoResponse);

  } catch (error) {
    console.error('Error creating logo:', error);
    return NextResponse.json({ 
      error: 'Failed to create logo',
      details: error instanceof Error ? error.message : undefined
    } satisfies ErrorResponse, { 
      status: 500 
    });
  }
} 