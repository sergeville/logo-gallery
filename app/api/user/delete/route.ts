import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';
import { connectToDatabase } from '@/app/lib/db';
import { User } from '@/app/lib/types';

export async function DELETE(request: Request) {
  try {
    const session = await getServerSession(authOptions);

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

    const { db } = await connectToDatabase();
    const usersCollection = db.collection<User>('users');

    const result = await usersCollection.deleteOne({ email });

    if (result.deletedCount === 0) {
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