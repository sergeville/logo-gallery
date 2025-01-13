import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import { ObjectId } from 'mongodb';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Not authenticated'
        }),
        { status: 401, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const { rating } = await request.json();

    // Validate rating
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Rating must be between 1 and 5'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('logos');

    // Find logo
    const logo = await collection.findOne({ _id: new ObjectId(params.id) });

    if (!logo) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Logo not found'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Update or add vote
    const vote = {
      userId: session.user.email,
      rating,
      timestamp: new Date()
    };

    const result = await collection.updateOne(
      { _id: new ObjectId(params.id) },
      { $pull: { votes: { userId: session.user.email } } } as any
    );

    await collection.updateOne(
      { _id: new ObjectId(params.id) },
      {
        $push: { votes: vote },
        $set: { updatedAt: new Date() }
      } as any
    );

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Vote recorded successfully'
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Vote error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to record vote'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 