import { NextResponse } from 'next/server';
import { Logo, ILogo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import { readFile } from 'fs/promises';
import path from 'path';
import { isValidObjectId } from 'mongoose';

const contentTypes: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp'
};

const ALLOWED_EXTENSIONS = new Set(['png', 'jpg', 'jpeg', 'gif', 'webp']);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('Processing image request for logo ID:', params.id);

  try {
    // Validate MongoDB ID format
    if (!isValidObjectId(params.id)) {
      console.warn('Invalid logo ID format:', params.id);
      return new NextResponse('Invalid logo ID format', { status: 400 });
    }

    try {
      console.log('Connecting to database...');
      await dbConnect();
      console.log('Database connection successful');
    } catch (error) {
      console.error('Database connection error:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return new NextResponse('Database connection error', { status: 503 });
    }

    // Check if Logo model is available
    if (!Logo || typeof Logo.findById !== 'function') {
      console.error('Logo model not properly initialized:', {
        model: !!Logo,
        findById: !!(Logo && Logo.findById),
        modelType: Logo ? typeof Logo : 'undefined'
      });
      return new NextResponse('Internal server error', { status: 500 });
    }

    let logo;
    try {
      console.log('Querying database for logo...');
      logo = await Logo.findById(params.id).select('imageUrl').lean<Pick<ILogo, '_id' | 'imageUrl'>>();
      console.log('Database query completed:', { found: !!logo });
    } catch (error) {
      console.error('Error querying logo:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      return new NextResponse('Error querying database', { status: 500 });
    }

    if (!logo) {
      console.warn('Logo not found:', params.id);
      return new NextResponse('Logo not found', { status: 404 });
    }

    if (!logo.imageUrl) {
      console.error('Logo found but imageUrl is missing:', { logoId: params.id });
      return new NextResponse('Image URL not found', { status: 404 });
    }

    const imagePath = path.join(process.cwd(), 'public', logo.imageUrl);
    console.log('Resolved image path:', imagePath);

    const ext = path.extname(imagePath).slice(1).toLowerCase();
    console.log('File extension:', ext);

    // Validate file extension
    if (!ALLOWED_EXTENSIONS.has(ext)) {
      console.warn('Invalid image format:', { extension: ext, path: imagePath });
      return new NextResponse('Invalid image format', { status: 400 });
    }

    const contentType = contentTypes[ext];
    if (!contentType) {
      console.warn('Unsupported image format:', { extension: ext, path: imagePath });
      return new NextResponse('Unsupported image format', { status: 400 });
    }

    try {
      console.log('Reading image file...');
      const imageBuffer = await readFile(imagePath);
      console.log('Image file read successfully:', {
        size: imageBuffer.length,
        path: imagePath
      });
      
      // Set cache headers for better performance
      const headers = new Headers({
        'Content-Type': contentType,
        'Cache-Control': 'public, max-age=31536000, immutable', // Cache for 1 year
        'Content-Length': imageBuffer.length.toString()
      });

      return new NextResponse(imageBuffer, { headers });
    } catch (error) {
      console.error('Error reading image file:', {
        name: error.name,
        message: error.message,
        stack: error.stack,
        path: imagePath
      });
      return new NextResponse('Image file not found', { status: 404 });
    }
  } catch (error) {
    console.error('Unhandled error serving logo image:', {
      name: error.name,
      message: error.message,
      stack: error.stack,
      logoId: params.id
    });
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 