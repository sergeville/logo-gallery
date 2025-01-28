import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { Logo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import { unlink } from 'fs/promises';
import path from 'path';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = await Promise.resolve(params.id);
  try {
    console.log('Fetching logo with ID:', id);
    await dbConnect();

    const logo = await Logo.findById(id).lean();
    
    if (!logo) {
      console.log('Logo not found:', id);
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
  const id = await Promise.resolve(params.id);
  console.log('Starting logo deletion for ID:', id);
  
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      console.log('Unauthorized: No session found');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    console.log('Connecting to database...');
    await dbConnect();

    // Find and validate the logo first
    console.log('Finding logo with ID:', id);
    const logo = await Logo.findById(id).lean();
    
    if (!logo) {
      console.log('Logo not found:', id);
      return new NextResponse('Logo not found', { status: 404 });
    }

    // Verify ownership
    if (logo.userId.toString() !== session.user.id) {
      console.log('Unauthorized: User does not own this logo');
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Try to delete the file first if it exists
    if (logo.imageUrl) {
      const filePath = path.join(process.cwd(), 'public', logo.imageUrl);
      console.log('Attempting to delete file:', filePath);
      try {
        await unlink(filePath);
        console.log('Successfully deleted file:', filePath);
      } catch (error) {
        console.error('Error deleting file:', error);
        // Continue with deletion even if file removal fails
      }
    }

    // Delete from database
    console.log('Deleting logo from database:', id);
    await Logo.findByIdAndDelete(id);
    console.log('Successfully deleted logo:', id);
    
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting logo:', {
      error: error instanceof Error ? {
        message: error.message,
        stack: error.stack,
        name: error.name
      } : error
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 