import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/lib/auth.config';
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
    const session = await getServerSession(authConfig);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    if (!name) {
      return NextResponse.json(
        { error: 'Missing required field: name' },
        { status: 400 }
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Please upload a JPEG, PNG, SVG, or WebP image.' },
        { status: 400 }
      );
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    await mkdir(UPLOAD_DIR, { recursive: true });

    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '');
    const fileBase = `${timestamp}-${sanitizedName}`;

    const buffer = Buffer.from(await file.arrayBuffer());

    const optimizedResult = await imageOptimizationService.optimizeBuffer(buffer, {
      quality: 80,
      format: 'image/webp'
    });

    const filePaths = {
      original: join(UPLOAD_DIR, `${fileBase}-original.${file.type.split('/')[1]}`),
      optimized: join(UPLOAD_DIR, `${fileBase}.webp`),
      thumbnail: join(UPLOAD_DIR, `${fileBase}-thumb.webp`),
    };

    await Promise.all([
      writeFile(filePaths.original, optimizedResult.buffer),
      writeFile(filePaths.optimized, optimizedResult.buffer),
      writeFile(filePaths.thumbnail, optimizedResult.buffer),
    ]);

    const responsiveFilePaths = new Map<string, string>();
    if (file.type !== 'image/svg+xml') {
      const responsiveSizes = {
        sm: 640,
        md: 768,
        lg: 1024,
        xl: 1280,
        '2xl': 1536,
      };

      for (const [size, width] of Object.entries(responsiveSizes)) {
        const responsiveResult = await imageOptimizationService.optimizeBuffer(
          optimizedResult.buffer,
          {
            width,
            format: 'image/webp',
            quality: 80
          }
        );

        const responsivePath = join(UPLOAD_DIR, `${fileBase}-${size}.webp`);
        await writeFile(responsivePath, responsiveResult.buffer);
        responsiveFilePaths.set(size, responsivePath.replace(process.cwd() + '/public', ''));
      }
    }

    await dbConnect();

    const logo = new Logo({
      title: name.trim(),
      description: description?.trim() || 'No description provided',
      imageUrl: filePaths.optimized.replace(process.cwd() + '/public', ''),
      thumbnailUrl: filePaths.thumbnail.replace(process.cwd() + '/public', ''),
      originalUrl: filePaths.original.replace(process.cwd() + '/public', ''),
      responsiveUrls: Object.fromEntries(responsiveFilePaths),
      userId: session.user.id,
      ownerName: session.user.name,
      fileSize: buffer.length,
      fileType: file.type,
      optimizedSize: optimizedResult.metadata.size,
      compressionRatio: ((1 - optimizedResult.metadata.size / buffer.length) * 100).toFixed(1),
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
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    );
  }
} 