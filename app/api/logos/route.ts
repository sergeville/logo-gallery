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
    const limit = parseInt(searchParams.get('limit') || '12');
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');

    const skip = (page - 1) * limit;

    await connectDB();

    // Build query
    let query: any = {};

    // Add user filter if userId is provided
    if (userId) {
      query.ownerId = userId;
    }

    // Add tag filter
    if (tag) {
      query.tags = tag;
    }

    // Add search filter
    if (search) {
      const searchQuery = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];

      query = userId 
        ? { $and: [{ ownerId: userId }, { $or: searchQuery }] }
        : { $or: searchQuery };
    }

    // Build sort options
    const sortOptions: any = {};
    if (sortBy === 'date') {
      sortOptions.uploadedAt = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'rating') {
      sortOptions.averageRating = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query with pagination
    const [logos, total] = await Promise.all([
      Logo.find(query)
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Logo.countDocuments(query)
    ]);

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return NextResponse.json({
      logos,
      pagination: {
        current: page,
        total: totalPages,
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching logos:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logos' },
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
      ownerId: session.user.id,
      ownerName: session.user.name,
      uploadedAt: new Date()
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