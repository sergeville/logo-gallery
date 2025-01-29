import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { Logo } from '@/app/lib/models/logo';
import dbConnect from '@/app/lib/db-config';
import { imageOptimizationService } from '@/app/lib/services';

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads');
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/svg+xml'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

export async function POST(request: Request) {
  try {
    // Ensure user is authenticated
    const session = await getServerSession(authOptions);
    if (!session) {
      return new NextResponse('Unauthorized', { status: 401 });
    }

    // Parse form data
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    // Validate inputs
    if (!file || !name) {
      return new NextResponse('Missing required fields', { status: 400 });
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return new NextResponse(
        'Invalid file type. Please upload a JPEG, PNG, SVG, or WebP image.',
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return new NextResponse(
        'File too large. Maximum size is 10MB.',
        { status: 400 }
      );
    }

    // Create upload directory if it doesn't exist
    await mkdir(UPLOAD_DIR, { recursive: true });

    // Generate unique filename base
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileBase = `${timestamp}-${sanitizedName}`;

    // Convert file to buffer
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Optimize image and generate variants
    const variants = await imageOptimizationService.createImageVariants(buffer, {
      format: 'webp', // Prefer WebP for better compression
    });

    // Save all image variants
    const filePaths = {
      original: join(UPLOAD_DIR, `${fileBase}-original.${file.type.split('/')[1]}`),
      optimized: join(UPLOAD_DIR, `${fileBase}.webp`),
      thumbnail: join(UPLOAD_DIR, `${fileBase}-thumb.webp`),
    };

    await Promise.all([
      writeFile(filePaths.original, variants.original),
      writeFile(filePaths.optimized, variants.optimized),
      writeFile(filePaths.thumbnail, variants.thumbnail),
    ]);

    // Save responsive variants if not SVG
    const responsiveFilePaths = new Map<string, string>();
    if (file.type !== 'image/svg+xml') {
      for (const [size, buffer] of variants.responsive) {
        const responsivePath = join(UPLOAD_DIR, `${fileBase}-${size}.webp`);
        await writeFile(responsivePath, buffer);
        responsiveFilePaths.set(size, responsivePath.replace(process.cwd() + '/public', ''));
      }
    }

    // Connect to database
    await dbConnect();

    // Create logo document
    const logo = new Logo({
      title: name.trim(),
      description: description?.trim() || 'No description provided',
      imageUrl: filePaths.optimized.replace(process.cwd() + '/public', ''),
      thumbnailUrl: filePaths.thumbnail.replace(process.cwd() + '/public', ''),
      originalUrl: filePaths.original.replace(process.cwd() + '/public', ''),
      responsiveUrls: Object.fromEntries(responsiveFilePaths),
      userId: session.user.id,
      ownerName: session.user.name,
      fileSize: file.size,
      fileType: file.type,
      optimizedSize: variants.optimized.length,
      uploadedAt: new Date(),
    });

    await logo.save();

    return NextResponse.json({
      success: true,
      logo: {
        id: logo._id,
        title: logo.title,
        imageUrl: logo.imageUrl,
        thumbnailUrl: logo.thumbnailUrl,
      },
    });
  } catch (error) {
    console.error('Error uploading logo:', error);
    return new NextResponse(
      'Internal server error',
      { status: 500 }
    );
  }
} 