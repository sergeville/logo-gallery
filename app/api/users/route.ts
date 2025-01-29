import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import connectDB from '@/app/lib/db';
import { User } from '@/app/lib/models/user';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    // Only allow authenticated users to view the user list
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = request.nextUrl;
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    await connectDB();

    const [users, total] = await Promise.all([
      User.find()
        .select('-password') // Exclude password field
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
      User.countDocuments()
    ]);

    const hasMore = total > skip + users.length;

    return NextResponse.json({
      users: users.map(user => ({
        id: user._id,
        name: user.name,
        email: user.email,
        bio: user.bio,
        location: user.location,
        website: user.website,
        createdAt: user.createdAt,
        totalLogos: user.totalLogos || 0
      })),
      pagination: {
        current: page,
        total: Math.ceil(total / limit),
        hasMore
      }
    });
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 