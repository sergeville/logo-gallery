import { connectToDatabase } from '@/app/lib/db';
import bcrypt from 'bcryptjs';

export async function POST(request: Request) {
  try {
    const { token, newPassword } = await request.json();

    if (!token || !newPassword) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: !token ? 'Reset token is required' : 'New password is required' 
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectToDatabase();
    const user = await db.collection('users').findOne({
      'resetToken.token': token,
      'resetToken.expires': { $gt: new Date() }
    });

    if (!user) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Invalid or expired reset token' 
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update password and remove reset token
    const result = await db.collection('users').updateOne(
      { _id: user._id },
      { 
        $set: { password: hashedPassword },
        $unset: { resetToken: "" }
      }
    );

    if (result.modifiedCount === 0) {
      return new Response(
        JSON.stringify({ 
          success: false, 
          message: 'Failed to update password' 
        }),
        { status: 500, headers: { 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: 'Password successfully reset' 
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Password reset error:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        message: 'Failed to reset password' 
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 