import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { v4 as uuidv4 } from 'uuid';
import dbConnect from '@/app/lib/db-config';
import { Logo } from '@/app/lib/models/logo';
import sharp from 'sharp';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export async function POST(request: Request) {
  try {
    console.log('Starting file upload process...');
    // Verify authentication
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      console.log('Upload failed: No authenticated session');
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Parse form data
    console.log('Parsing form data...');
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    console.log('Form data received:', {
      fileName: file?.name,
      fileType: file?.type,
      fileSize: file?.size,
      name,
      descriptionLength: description?.length
    });

    if (!file || !name) {
      console.log('Upload failed: Missing required fields', { file: !!file, name: !!name });
      return NextResponse.json(
        { success: false, message: 'File and name are required' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      console.log('Upload failed: File too large', { size: file.size, maxSize: MAX_FILE_SIZE });
      return NextResponse.json(
        { success: false, message: 'File size must be less than 5MB' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      console.log('Upload failed: Invalid file type', { type: file.type, allowedTypes: ALLOWED_TYPES });
      return NextResponse.json(
        { success: false, message: 'Only PNG, JPEG, and SVG files are allowed' },
        { status: 400 }
      );
    }

    // Generate unique filenames
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    const filename = `${uuidv4()}.${ext}`;
    const thumbnailFilename = `${uuidv4()}-thumb.${ext}`;

    console.log('Generated filenames:', { filename, thumbnailFilename });

    // Convert file to buffer
    console.log('Converting file to buffer...');
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save original file
    const filePath = join(UPLOAD_DIR, filename);
    console.log('Saving original file to:', filePath);
    try {
      await writeFile(filePath, buffer);
      console.log('Original file saved successfully');
    } catch (error) {
      console.error('Error saving original file:', error);
      throw error;
    }

    // Generate and save thumbnail (except for SVG files)
    let thumbnailPath = filePath;
    if (file.type !== 'image/svg+xml') {
      thumbnailPath = join(UPLOAD_DIR, thumbnailFilename);
      console.log('Generating thumbnail:', thumbnailPath);
      try {
        await sharp(buffer)
          .resize(300, 300, {
            fit: 'inside',
            withoutEnlargement: true
          })
          .toFile(thumbnailPath);
        console.log('Thumbnail generated successfully');
      } catch (error) {
        console.error('Error generating thumbnail:', error);
        throw error;
      }
    }

    // Get image dimensions
    let dimensions = { width: 0, height: 0 };
    if (file.type !== 'image/svg+xml') {
      console.log('Getting image dimensions...');
      try {
        const metadata = await sharp(buffer).metadata();
        dimensions = {
          width: metadata.width || 0,
          height: metadata.height || 0
        };
        console.log('Image dimensions:', dimensions);
      } catch (error) {
        console.error('Error getting image dimensions:', error);
        throw error;
      }
    }

    // Save to database
    console.log('Connecting to database...');
    try {
      await dbConnect();
      console.log('Database connected successfully');
    } catch (error) {
      console.error('Error connecting to database:', error);
      throw error;
    }

    console.log('Creating new Logo document...');
    const logo = new Logo({
      title: name.trim(),
      description: description?.trim() || 'No description provided',
      imageUrl: `/uploads/${filename}`,
      thumbnailUrl: `/uploads/${file.type === 'image/svg+xml' ? filename : thumbnailFilename}`,
      dimensions,
      fileSize: file.size,
      fileType: file.type,
      userId: session.user.id,
      ownerName: session.user.name,
      category: 'uncategorized',
      tags: [],
      uploadedAt: new Date()
    });

    try {
      console.log('Saving Logo document to database...');
      await logo.save();
      console.log('Logo document saved successfully');
    } catch (validationError: any) {
      console.error('Validation error:', validationError);
      return NextResponse.json({
        success: false,
        message: 'Validation failed',
        errors: validationError.errors
      }, { status: 400 });
    }

    console.log('Upload process completed successfully');

    return NextResponse.json({
      success: true,
      message: 'Logo uploaded successfully',
      logo: {
        _id: logo._id,
        title: logo.title,
        description: logo.description,
        imageUrl: logo.imageUrl,
        thumbnailUrl: logo.thumbnailUrl
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: error instanceof Error ? error.message : 'Internal server error',
        error: error instanceof Error ? error.toString() : undefined
      },
      { status: 500 }
    );
  }
} 