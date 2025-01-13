import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import { ObjectId } from 'mongodb';

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json(
        { success: false, message: 'Not authenticated' },
        { status: 401 }
      );
    }

    const data = await request.json();
    const { username, email, name, bio, avatarUrl, website, location, company } = data;

    if (!username || !email || !name) {
      return NextResponse.json(
        { success: false, message: 'Required fields missing' },
        { status: 400 }
      );
    }

    const db = await connectToDatabase();
    const usersCollection = db.collection('users');

    // Check for existing username
    const existingUsername = await usersCollection.findOne({
      username,
      _id: { $ne: new ObjectId(session.user.id) }
    });

    if (existingUsername) {
      return NextResponse.json(
        { success: false, message: 'Username already taken' },
        { status: 409 }
      );
    }

    // Check for existing email
    const existingEmail = await usersCollection.findOne({
      email,
      _id: { $ne: new ObjectId(session.user.id) }
    });

    if (existingEmail) {
      return NextResponse.json(
        { success: false, message: 'Email already registered' },
        { status: 409 }
      );
    }

    // Update user profile
    const result = await usersCollection.updateOne(
      { _id: new ObjectId(session.user.id) },
      {
        $set: {
          username,
          email,
          name,
          profile: {
            bio,
            avatarUrl,
            website,
            location,
            company
          },
          updatedAt: new Date()
        }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json(
        { success: false, message: 'Failed to update profile' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true, message: 'Profile updated successfully' });
  } catch (error) {
    console.error('Profile update error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to update profile' },
      { status: 500 }
    );
  }
} 