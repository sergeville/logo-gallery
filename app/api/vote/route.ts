import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../auth/[...nextauth]/options';
import { connectToDatabase } from '../../../lib/db';
import { Logo } from '../../../lib/types';
import { ObjectId } from 'mongodb';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { logoId } = await request.json();
    if (!logoId) {
      return NextResponse.json({ error: 'Logo ID is required' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const logo = await db.collection<Logo>('logos').findOne({ _id: new ObjectId(logoId) });

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    // Add vote
    const result = await db.collection<Logo>('logos').updateOne(
      { _id: new ObjectId(logoId) },
      {
        $push: {
          votes: {
            userId: session.user.id,
            rating: 1,
            timestamp: new Date()
          }
        },
        $inc: { totalVotes: 1 },
        $set: { updatedAt: new Date() }
      }
    );

    if (result.modifiedCount === 0) {
      return NextResponse.json({ error: 'Failed to vote for logo' }, { status: 500 });
    }

    return NextResponse.json({ message: 'Vote recorded successfully' });
  } catch (error) {
    console.error('Error voting for logo:', error);
    return NextResponse.json({ error: 'Failed to vote for logo' }, { status: 500 });
  }
} 