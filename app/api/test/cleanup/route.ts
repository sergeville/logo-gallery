import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function POST() {
  // Only allow in development/test environment
  if (process.env.NODE_ENV === 'production') {
    return NextResponse.json({ error: 'Not available in production' }, { status: 403 });
  }

  try {
    // Delete test users
    await prisma.user.deleteMany({
      where: {
        OR: [
          { email: { startsWith: 'test_' } },
          { username: { startsWith: 'testuser_' } }
        ]
      }
    });

    // Delete test logos
    await prisma.logo.deleteMany({
      where: {
        OR: [
          { title: { startsWith: 'Test Logo' } },
          { description: { contains: 'test' } }
        ]
      }
    });

    return NextResponse.json({ message: 'Test data cleaned up successfully' });
  } catch (error) {
    console.error('Error cleaning up test data:', error);
    return NextResponse.json({ error: 'Failed to clean up test data' }, { status: 500 });
  }
}

// Disallow other methods
export async function GET() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PUT() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function DELETE() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
}

export async function PATCH() {
  return NextResponse.json({ error: 'Method not allowed' }, { status: 405 });
} 