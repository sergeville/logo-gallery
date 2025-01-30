import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/lib/auth.config';
import dbConnect from '@/app/lib/db-config';
import { User } from '@/app/lib/models/user';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    const { email } = session.user;

    if (!email) {
      return NextResponse.json({
        success: false,
        message: 'User email not found in session'
      }, { status: 400 });
    }

    await dbConnect();
    const user = await User.findById(session.user.id).select('-password').lean();

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      user
    });

  } catch (error) {
    console.error('Error fetching user:', error);
    return NextResponse.json({
      success: false,
      message: 'Error fetching user'
    }, { status: 500 });
  }
} 