import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    data: {
      gallery: {
        columns: 3,
        spacing: 16,
        maxWidth: 1200,
        imageHeight: 200,
        previewSize: 800,
      },
      validation: {
        maxNameLength: 50,
        allowedImageTypes: ['jpg', 'jpeg', 'png', 'gif', 'webp'],
        maxFileSize: 5242880, // 5MB
      }
    }
  });
} 