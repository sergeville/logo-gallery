import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { connectToDatabase } from '../../../../lib/db';
import { User } from '../../../../lib/types';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { logoId } = await request.json();

    if (!logoId) {
      return NextResponse.json({ message: 'Logo ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Add to favorites
    const result = await usersCollection.updateOne(
      { email: session.user.email as string },
      {
        $addToSet: { favorites: logoId },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Failed to add to favorites' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Added to favorites' });
  } catch (error) {
    console.error('Error adding to favorites:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { logoId } = await request.json();

    if (!logoId) {
      return NextResponse.json({ message: 'Logo ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    // Remove from favorites
    const result = await usersCollection.updateOne(
      { email: session.user.email as string },
      {
        $pull: { favorites: logoId },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ message: 'Failed to remove from favorites' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Removed from favorites' });
  } catch (error) {
    console.error('Error removing from favorites:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.email) {
      return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const user = await usersCollection.findOne({ email: session.user.email as string });

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ favorites: user.favorites || [] });
  } catch (error) {
    console.error('Error getting favorite logos:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
} 