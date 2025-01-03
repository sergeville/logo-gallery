import { NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import { join } from 'path';
import { addLogo } from '../../../lib/store';
import { cookies } from 'next/headers';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const name = formData.get('name') as string;
    const description = formData.get('description') as string;
    const tags = formData.get('tags') as string;

    // Get user data from cookie
    const cookieStore = cookies();
    const userDataCookie = cookieStore.get('user');
    
    if (!userDataCookie?.value) {
      return NextResponse.json(
        { success: false, message: 'User not authenticated' },
        { status: 401 }
      );
    }

    const userData = JSON.parse(userDataCookie.value);

    if (!file) {
      return NextResponse.json(
        { success: false, message: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Create a unique filename
    const timestamp = Date.now();
    const filename = `${timestamp}-${file.name}`;
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Save file to public/images
    const path = join(process.cwd(), 'public/images', filename);
    await writeFile(path, buffer);

    // Create logo entry and add to store
    const newLogo = {
      _id: timestamp.toString(),
      name,
      url: `/images/${filename}`,
      description,
      userId: {
        username: userData.username || userData.email.split('@')[0], // Use username or email prefix
        profileImage: userData.profileImage || 'https://placehold.co/50x50'
      },
      tags: tags.split(',').map(tag => tag.trim()),
      averageRating: 0
    };

    // Add to store
    const savedLogo = addLogo(newLogo);

    return NextResponse.json({
      success: true,
      logo: savedLogo
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to upload file' },
      { status: 500 }
    );
  }
} 