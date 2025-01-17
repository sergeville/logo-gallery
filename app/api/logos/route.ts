/**
 * Logos API Route
 * Handles fetching and managing logo data with pagination support.
 * This route provides endpoints for retrieving logos with proper client-side data transformation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import connectDB from '@/app/lib/db';
import { Logo } from '@/app/lib/models/logo';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    await connectDB();

    const [logos, total] = await Promise.all([
      Logo.find()
        .sort({ uploadedAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      Logo.countDocuments()
    ]);

    const hasMore = total > skip + logos.length;

    return NextResponse.json({
      logos,
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching logos:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { name, description, imageUrl, thumbnailUrl, dimensions, fileSize, fileType, category, tags } = data;

    if (!name || !imageUrl) {
      return NextResponse.json(
        { error: 'Name and image URL are required' },
        { status: 400 }
      );
    }

    await connectDB();

    const logo = new Logo({
      _id: new mongoose.Types.ObjectId(),
      name,
      description,
      imageUrl,
      thumbnailUrl,
      dimensions,
      fileSize,
      fileType,
      category,
      tags,
      userId: session.user.id,
      ownerName: session.user.name,
      uploadedAt: new Date(),
      totalVotes: 0,
      averageRating: 0,
      votes: []
    });

    await logo.save();

    return NextResponse.json(logo, { status: 201 });
  } catch (error) {
    console.error('Error creating logo:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 