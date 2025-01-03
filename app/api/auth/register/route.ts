import { NextResponse } from 'next/server';
import { connectDB } from '../../../../lib/db';
import jwt from 'jsonwebtoken';

export async function POST(request: Request) {
  try {
    await connectDB();

    const { email, password, username } = await request.json();

    // For testing purposes, create a mock user
    const mockUser = {
      id: '1',
      email,
      username: username || email.split('@')[0], // Use provided username or email prefix
      profileImage: 'https://placehold.co/50x50'
    };

    // Generate JWT token
    const token = jwt.sign(
      { userId: mockUser.id },
      process.env.JWT_SECRET || 'default-secret-key',
      { expiresIn: '7d' }
    );

    // Return success response
    return NextResponse.json({
      success: true,
      user: mockUser,
      token
    });

  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Registration failed' },
      { status: 400 }
    );
  }
} 