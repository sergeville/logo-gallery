import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, password } = await request.json();

    // For testing purposes, accept any login
    const mockUser = {
      id: '1',
      email: email,
      username: email.split('@')[0],
      profileImage: 'https://placehold.co/50x50'
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response with token
    return NextResponse.json({
      success: true,
      user: mockUser,
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Authentication failed' },
      { status: 401 }
    );
  }
} 