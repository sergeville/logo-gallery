import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../../auth/[...nextauth]/options';
import { connectToDatabase } from '../../../../../lib/db';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check authentication and admin role
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify admin role
    const { db } = await connectToDatabase();
    const user = await db.collection('users').findOne({ email: session.user.email });
    if (!user || user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    // Get new owner ID from request body
    const { newOwnerId } = await request.json();
    if (!newOwnerId) {
      return NextResponse.json({ error: 'New owner ID is required' }, { status: 400 });
    }

    // Verify new owner exists
    const newOwner = await db.collection('users').findOne({ _id: new ObjectId(newOwnerId) });
    if (!newOwner) {
      return NextResponse.json({ error: 'New owner not found' }, { status: 404 });
    }

    // Update logo owner
    const result = await db.collection('logos').updateOne(
      { _id: new ObjectId(params.id) },
      { 
        $set: { 
          ownerId: new ObjectId(newOwnerId),
          ownerName: newOwner.name || newOwner.email,
          updatedAt: new Date()
        } 
      }
    );

    if (result.matchedCount === 0) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({ 
      message: 'Logo owner updated successfully',
      ownerName: newOwner.name || newOwner.email
    });
  } catch (error) {
    console.error('Error updating logo owner:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 