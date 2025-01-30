import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import connectDB from '@/app/lib/db';
import { validateUserProfile } from '@/app/lib/validation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import { User } from '@/app/lib/models/user';
import { Logo } from '@/app/lib/models/logo';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Get user data
    const user = await User.findById(session.user.id).select('-password');
    
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Get user's logos stats
    const userLogos = await Logo.find({ ownerId: user._id }).select('votes');

    // Calculate total votes
    const totalVotes = userLogos.reduce((sum, logo) => sum + (logo.votes?.length || 0), 0);

    return NextResponse.json({
      user: {
        ...session.user,
        stats: {
          totalLogos: userLogos.length,
          totalVotes
        }
      }
    });
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    await connectDB();
    const updateData = await request.json();

    // Validate update data
    const validationResult = validateUserProfile(updateData);
    if (validationResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid data',
        details: validationResult.errors 
      }, { status: 400 });
    }

    const user = await User.findById(session.user.id);
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove fields that shouldn't be updated
    const { password, role, _id, ...updateFields } = updateData;
    updateFields.updatedAt = new Date();

    const result = await User.findByIdAndUpdate(
      user._id,
      { $set: updateFields },
      { new: true }
    ).select('-password');

    if (!result) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 