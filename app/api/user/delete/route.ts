import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authConfig } from '@/app/lib/auth.config';
import dbConnect from '@/app/lib/db-config';
import { User } from '@/app/lib/models/user';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authConfig);

    if (!session?.user?.id) {
      return NextResponse.json({
        success: false,
        message: 'Not authenticated'
      }, { status: 401 });
    }

    await dbConnect();
    const result = await User.findByIdAndDelete(session.user.id);

    if (!result) {
      return NextResponse.json({
        success: false,
        message: 'User not found'
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      message: 'User deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({
      success: false,
      message: 'Error deleting user'
    }, { status: 500 });
  }
} 