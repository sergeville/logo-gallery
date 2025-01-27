import { NextResponse } from 'next/server';
import { connectToDatabase } from '../../../../lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '../../auth/[...nextauth]/options';
import { ObjectId } from 'mongodb';
import { unlink } from 'fs/promises';
import { join } from 'path';
import { ClientLogo, Logo } from '../../../../lib/types';
import { transformLogo } from '../../../../lib/transforms';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid logo ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const logo = await db
      .collection<Logo>('logos')
      .findOne({ _id: new ObjectId(params.id) });

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json(transformLogo(logo));
  } catch (error) {
    console.error('Error fetching logo:', error);
    return NextResponse.json(
      { error: 'Failed to fetch logo' },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admin users can update logos' },
        { status: 403 }
      );
    }

    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid logo ID' }, { status: 400 });
    }

    const body = await request.json();
    const { name, description, tags, url, imageUrl } = body;

    if (!name) {
      return NextResponse.json(
        { error: 'Name is required' },
        { status: 400 }
      );
    }

    const { db } = await connectToDatabase();
    const updateResult = await db.collection<Logo>('logos').updateOne(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          name,
          description,
          tags: tags || [],
          url,
          imageUrl,
          updatedAt: new Date()
        }
      }
    );

    if (!updateResult.matchedCount) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    const updatedLogo = await db
      .collection<Logo>('logos')
      .findOne({ _id: new ObjectId(params.id) });

    return NextResponse.json(transformLogo(updatedLogo!));
  } catch (error) {
    console.error('Error updating logo:', error);
    return NextResponse.json(
      { error: 'Failed to update logo' },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if ((session.user as any).role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Only admin users can delete logos' },
        { status: 403 }
      );
    }

    if (!params.id || !ObjectId.isValid(params.id)) {
      return NextResponse.json({ error: 'Invalid logo ID' }, { status: 400 });
    }

    const { db } = await connectToDatabase();
    const deleteResult = await db
      .collection<Logo>('logos')
      .deleteOne({ _id: new ObjectId(params.id) });

    if (!deleteResult.deletedCount) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Logo deleted successfully' });
  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json(
      { error: 'Failed to delete logo' },
      { status: 500 }
    );
  }
} 