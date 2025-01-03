import { NextResponse } from 'next/server';
import { auth } from '@/middleware/auth';
import { connectDB } from '@/lib/db';

export async function GET() {
  try {
    await connectDB();
    const user = await auth();

    if (user instanceof NextResponse) {
      return user;
    }

    return NextResponse.json({ user });
  } catch {
    return NextResponse.json(
      { message: 'Server error' },
      { status: 500 }
    );
  }
} 