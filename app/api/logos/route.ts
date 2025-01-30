/**
 * Logos API Route
 * Handles fetching and managing logo data with pagination support.
 * This route provides endpoints for retrieving logos with proper client-side data transformation.
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/lib/auth.config';
import dbConnect from '@/app/lib/db-config';
import { Logo } from '@/app/lib/models/logo';
import mongoose from 'mongoose';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = Math.max(1, parseInt(searchParams.get('limit') || '12'));
    const sortBy = searchParams.get('sortBy') || 'date';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const tag = searchParams.get('tag');
    const search = searchParams.get('search');
    const userId = searchParams.get('userId');
    const isVotePage = searchParams.get('votePage') === 'true';

    const skip = (page - 1) * limit;

    await dbConnect();

    // Get the current user's session if we're on the vote page
    let currentUserId = null;
    if (isVotePage) {
      const session = await getServerSession(authConfig);
      if (session?.user?.id) {
        currentUserId = session.user.id;
      }
    }

    // Build query
    let query: any = {};

    // Add user filter if userId is provided
    if (userId) {
      query.userId = userId;
    }

    // For vote page, exclude user's own logos
    if (isVotePage && currentUserId) {
      query.userId = { $ne: currentUserId };
    }

    // Add tag filter
    if (tag) {
      query.tags = tag;
    }

    // Add search filter
    if (search) {
      const searchQuery = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $regex: search, $options: 'i' } },
        { ownerName: { $regex: search, $options: 'i' } }
      ];

      query = userId 
        ? { $and: [{ userId }, { $or: searchQuery }] }
        : { $or: searchQuery };
    }

    // Build sort options
    const sortOptions: any = {};
    if (sortBy === 'date') {
      sortOptions.uploadedAt = sortOrder === 'asc' ? 1 : -1;
    } else if (sortBy === 'votes') {
      sortOptions.totalVotes = sortOrder === 'asc' ? 1 : -1;
    }

    // Execute query with pagination
    const [logos, total] = await Promise.all([
      Logo.find(query)
        .select('_id title description imageUrl thumbnailUrl userId ownerName totalVotes votes createdAt')
        .sort(sortOptions)
        .skip(skip)
        .limit(limit)
        .lean(),
      Logo.countDocuments(query)
    ]);

    // Transform the data to match the frontend interface
    const transformedLogos = logos.map(logo => ({
      _id: logo._id,
      name: logo.title,
      description: logo.description || '',
      imageUrl: logo.imageUrl,
      thumbnailUrl: logo.thumbnailUrl,
      userId: logo.userId,
      ownerName: logo.ownerName,
      totalVotes: logo.totalVotes || 0,
      votes: logo.votes || [],
      createdAt: logo.createdAt
    }));

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    // Sort logos based on query parameter
    let sortedLogos = transformedLogos;
    if (sortBy === 'date') {
      sortedLogos = transformedLogos.sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    } else if (sortBy === 'votes') {
      sortedLogos = transformedLogos.sort((a, b) => b.totalVotes - a.totalVotes);
    }

    return NextResponse.json({
      logos: sortedLogos,
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
    const session = await getServerSession(authConfig);
    
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

    await dbConnect();

    const logo = new Logo({
      _id: new mongoose.Types.ObjectId(),
      title: name.trim(),
      description: description?.trim() || 'No description provided',
      imageUrl,
      thumbnailUrl,
      dimensions,
      fileSize,
      fileType,
      userId: session.user.id.toString(),
      ownerName: session.user.name,
      category: category || 'uncategorized',
      tags: tags || [],
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