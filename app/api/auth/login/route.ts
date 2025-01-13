import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { getUserByEmail, validatePassword, createUser } from '@/app/lib/store';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    console.log('Login attempt:', body);

    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: 'Email and password are required' },
        { status: 400 }
      );
    }

    let user = await getUserByEmail(email);
    
    // For development: create a test user if it doesn't exist
    if (!user && email === 'test@example.com' && password === 'test123') {
      user = await createUser(email, password);
    }

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    const { isValid } = await validatePassword(email, password);
    console.log('Password validation:', { isValid });

    if (!isValid) {
      return NextResponse.json(
        { success: false, message: 'Invalid credentials' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = jwt.sign(
      { email: user.email },
      process.env.JWT_SECRET || 'default_secret',
      { expiresIn: '1d' }
    );

    // Set cookie
    const response = NextResponse.json(
      { success: true, message: 'Login successful', user: { email: user.email } },
      { status: 200 }
    );

    response.cookies.set('auth_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    console.log('Login successful, token set');
    return response;

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error' },
      { status: 500 }
    );
  }
} 