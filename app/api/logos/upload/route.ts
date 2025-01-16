import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, unlink } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/app/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;

    if (!file || !name) {
      return NextResponse.json(
        { success: false, message: 'File and name are required' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, message: 'Only image files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filename
    const ext = file.name.split('.').pop();
    const filename = `${uuidv4()}.${ext}`;
    const uploadDir = join(process.cwd(), 'public', 'uploads');

    // Save file
    try {
      await writeFile(join(uploadDir, filename), Buffer.from(await file.arrayBuffer()));
    } catch (error) {
      console.error('Error saving file:', error);
      return NextResponse.json(
        { success: false, message: 'Error saving file' },
        { status: 500 }
      );
    }

    // Save logo metadata to database
    const { db } = await connectToDatabase();
    const logoData = {
      name,
      filename,
      url: `/uploads/${filename}`,
      uploadedAt: new Date(),
      userId: new ObjectId(session.user.id),
      averageRating: 0,
      totalVotes: 0,
      dimensions: {
        width: 0,
        height: 0
      },
      fileSize: file.size,
      fileType: file.type,
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const result = await db.collection('logos').insertOne(logoData);

    if (!result.insertedId) {
      // If database insert fails, we should clean up the uploaded file
      try {
        await unlink(join(uploadDir, filename));
      } catch (unlinkError) {
        console.error('Failed to clean up file after failed db insert:', unlinkError);
      }
      
      return NextResponse.json(
        { success: false, message: 'Failed to save logo metadata' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo: {
        ...logoData,
        _id: result.insertedId
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 