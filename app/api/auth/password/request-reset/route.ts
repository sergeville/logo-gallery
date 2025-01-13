import { connectToDatabase } from '../../../../lib/db-config';
import { sendEmail } from '../../../../lib/email';
import crypto from 'crypto';

export async function POST(request: Request) {
  try {
    const { email } = await request.json();

    if (!email) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Email is required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({ email });

    if (!user) {
      // Return success even if user not found for security
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'Password reset instructions sent' 
        }),
        { status: 200, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Generate reset token
    const token = crypto.randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000); // 1 hour from now

    // Save reset token
    await db.collection('users').updateOne(
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

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password reset instructions sent' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Password reset request error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to process password reset request' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 