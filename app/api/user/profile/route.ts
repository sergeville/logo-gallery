import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { ObjectId } from 'mongodb';
import { connectToDatabase } from '@/app/lib/db';
import { validateUserProfile } from '@/app/lib/validation';

export async function GET(request: NextRequest) {
  try {
    const sessionCookie = cookies().get('session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ _id: new ObjectId(sessionCookie.value) });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive data
    const { password, ...userWithoutPassword } = user as { password?: string } & Record<string, unknown>;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    const sessionCookie = cookies().get('session');
    if (!sessionCookie?.value) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const updateData = await request.json();

    // Validate update data
    const validationResult = validateUserProfile(updateData);
    if (validationResult.errors.length > 0) {
      return NextResponse.json({ 
        error: 'Invalid data',
        details: validationResult.errors 
      }, { status: 400 });
    }

    const user = await db.collection('users').findOne({ _id: new ObjectId(sessionCookie.value) });
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove fields that shouldn't be updated
    const { password, role, _id, ...updateFields } = updateData;
    updateFields.updatedAt = new Date();

    const result = await db.collection('users').updateOne(
      { _id: user._id },
      { $set: updateFields }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
    }

    const updatedUser = await db.collection('users').findOne({ _id: user._id });
    if (!updatedUser) {
      return NextResponse.json({ error: 'Failed to fetch updated user' }, { status: 500 });
    }

    const { password: _, ...userWithoutPassword } = updatedUser as { password?: string } & Record<string, unknown>;
    return NextResponse.json(userWithoutPassword);
  } catch (error) {
    console.error('Error updating user profile:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 