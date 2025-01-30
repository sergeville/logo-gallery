import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db-config';
import { User } from '@/app/lib/models/user';
import { sendEmail } from '@/app/lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return NextResponse.json(
        { success: false, message: 'Email is required' },
        { status: 400 }
      );
    }

    await dbConnect();
    const user = await User.findOne({ email });

    if (!user) {
      // Return success even if user not found for security
      return NextResponse.json(
        { success: true, message: 'Password reset instructions sent' },
        { status: 200 }
      );
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await User.updateOne(
      { _id: user._id },
      { 
        $set: { 
          resetToken: {
            token,
            expires
          }
        }
      }
    );

    // Send reset email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
    await sendEmail({
      to: email,
      subject: 'Password Reset Request',
      html: `<p>Please click <a href="${resetUrl}">here</a> to reset your password.</p>`
    });

    return NextResponse.json(
      { success: true, message: 'Password reset instructions sent' },
      { status: 200 }
    );

  } catch (error) {
    console.error('Password reset request error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to process password reset request' },
      { status: 500 }
    );
  }
} 