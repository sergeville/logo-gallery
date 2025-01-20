import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { ObjectId } from 'mongodb';
import { unlink } from 'fs/promises';
import { join } from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const logo = await db.collection('logos').findOne({
      _id: new ObjectId(params.id),
    });

    if (!logo) {
      return new NextResponse('Logo not found', { status: 404 });
    }

    return NextResponse.json(logo);
  } catch (error) {
    console.error('Error fetching logo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { db } = await connectToDatabase();
    const logosCollection = db.collection('logos');

    // Find the logo first to verify ownership and get file info
    const logo = await logosCollection.findOne({
      _id: new ObjectId(params.id)
    });

    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    // Verify ownership
    if (logo.ownerId.toString() !== session.user.id) {
      return NextResponse.json({ error: 'Unauthorized - You can only delete your own logos' }, { status: 403 });
    }

    // Delete from database
    const result = await logosCollection.deleteOne({
      _id: new ObjectId(params.id)
    });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Failed to delete logo' }, { status: 500 });
    }

    // Delete the file from uploads directory
    const filename = logo.imageUrl.split('/').pop();
    if (filename) {
      const filePath = join(process.cwd(), 'public', 'uploads', filename);
      try {
        await unlink(filePath);
      } catch (error) {
        console.error('Error deleting logo file:', error);
        // Don't fail the request if file deletion fails
      }
    }

    return NextResponse.json({ message: 'Logo deleted successfully' });

  } catch (error) {
    console.error('Error deleting logo:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 