import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { User } from '@/app/models/User';

export async function auth(request: Request) {
  try {
    const cookieStore = cookies();
    const userCookie = cookieStore.get('user');
    
    if (!userCookie?.value) {
      return null;
    }

    const user = JSON.parse(userCookie.value);
    return user;
  } catch (error) {
    console.error('Auth error:', error);
    return null;
  }
} 