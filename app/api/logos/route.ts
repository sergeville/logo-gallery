/**
 * Logos API Route
 * Handles fetching and managing logo data with pagination support.
 * This route provides endpoints for retrieving logos with proper client-side data transformation.
 */

import { NextResponse, type NextRequest } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { connectToDatabase } from '@/app/lib/db';
import { Logo } from '@/app/models/Logo';
import { ClientLogo, transformLogo } from '@/app/lib/transforms';
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

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '12');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';
    const tag = searchParams.get('tag') || '';

    const { db } = await connectToDatabase();
    const collection = db.collection<Logo>('logos');

    // Build query
    const query: any = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    if (category) {
      query.category = category;
    }
    if (tag) {
      query.tags = tag;
    }

    // Get total count for pagination
    const total = await collection.countDocuments(query);
    const hasMore = total > page * limit;

    // Get paginated results
    const logos = await collection
      .find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .toArray();

    // Transform logos for client
    const transformedLogos = logos.map(logo => transformLogo(logo as WithId<Logo>));

    return NextResponse.json({
      logos: transformedLogos,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore
      }
    } satisfies GetLogosResponse);

  } catch (error) {
    console.error('Error fetching logos:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch logos',
      details: error instanceof Error ? error.message : undefined
    } satisfies ErrorResponse, { 
      status: 500 
    });
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

    const { db } = await connectToDatabase();
    const collection = db.collection<Logo>('logos');

    const logo: Logo = {
      _id: new ObjectId(),
      name: body.name,
      description: body.description,
      imageUrl: body.imageUrl,
      thumbnailUrl: body.imageUrl, // TODO: Generate thumbnail
      ownerId: new ObjectId(session.user.id),
      tags: body.tags || [],
      category: 'uncategorized', // TODO: Add category support
      dimensions: { width: 0, height: 0 }, // TODO: Extract from image
      fileSize: 0, // TODO: Get file size
      fileType: body.imageUrl.split('.').pop() || 'unknown',
      createdAt: new Date(),
      updatedAt: new Date(),
      averageRating: 0,
      totalVotes: 0
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