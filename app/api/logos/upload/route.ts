import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import { connectToDatabase } from '@/app/lib/db';

export async function POST(request: Request) {
  try {
    // Verify authentication
    const cookieStore = cookies();
    const token = cookieStore.get('auth_token');

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    try {
      jwt.verify(token.value, process.env.JWT_SECRET || 'default_secret');
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'Invalid token' },
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
    const db = await connectToDatabase();
    const logoData = {
      name,
      filename,
      url: `/uploads/${filename}`,
      uploadedAt: new Date(),
      ownerId: token.value, // You might want to decode the token to get the actual user ID
      averageRating: 0,
      totalVotes: 0,
      dimensions: {
        width: 0, // You might want to get actual image dimensions
        height: 0
      },
      fileSize: file.size,
      fileType: file.type
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