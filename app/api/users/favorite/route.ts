import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { connectToDatabase } from '@/app/lib/db';
import { User } from '@/app/lib/types';
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

    if (!ObjectId.isValid(logoId)) {
      return NextResponse.json({ message: 'Invalid logo ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const result = await usersCollection.updateOne(
      { email: session.user.email as string },
      {
        $addToSet: { favorites: new ObjectId(logoId) },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Logo added to favorites' });
  } catch (error) {
    console.error('Error adding logo to favorites:', error);
    return NextResponse.json(
      { message: 'Error adding logo to favorites' },
      { status: 500 }
    );
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

    if (!ObjectId.isValid(logoId)) {
      return NextResponse.json({ message: 'Invalid logo ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const result = await usersCollection.updateOne(
      { email: session.user.email as string },
      {
        $pull: { favorites: new ObjectId(logoId) },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Logo removed from favorites' });
  } catch (error) {
    console.error('Error removing logo from favorites:', error);
    return NextResponse.json(
      { message: 'Error removing logo from favorites' },
      { status: 500 }
    );
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

    const user = await usersCollection.findOne(
      { email: session.user.email as string },
      { projection: { favorites: 1 } }
    );

    if (!user) {
      return NextResponse.json({ message: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({ favorites: user.favorites || [] });
  } catch (error) {
    console.error('Error getting favorite logos:', error);
    return NextResponse.json(
      { message: 'Error getting favorite logos' },
      { status: 500 }
    );
  }
} 