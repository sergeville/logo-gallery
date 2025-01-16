import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/route';
import { connectToDatabase } from '@/app/lib/db';
import { ObjectId, Document, WithId } from 'mongodb';
import type { UpdateFilter, Collection, PullOperator, PushOperator, Filter } from 'mongodb';

interface Vote {
  userId: string;
  rating: number;
  timestamp: Date;
}

interface Logo extends Document {
  _id: ObjectId;
  name: string;
  imageUrl: string;
  thumbnailUrl: string;
  userId: string;
  votes: Vote[];
  updatedAt: Date;
  averageRating: number;
  totalVotes: number;
}

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

    const { db } = await connectToDatabase();
    const collection: Collection<Logo> = db.collection('logos');

    // Create filter with ObjectId
    let filter: Filter<Logo>;
    try {
      filter = { _id: new ObjectId(params.id) };
    } catch (error) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid logo ID format'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Find logo
    const logo = await collection.findOne(filter);

    if (!logo) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Logo not found'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Remove existing vote if any
    const pullUpdate = {
      $pull: {
        votes: { userId: session.user.id }
      }
    } as unknown as UpdateFilter<Logo>;
    
    await collection.updateOne(filter, pullUpdate);

    // Add new vote
    const vote = {
      userId: session.user.id,
      rating: 1,
      createdAt: new Date()
    };

    const pushUpdate = {
      $push: {
        votes: {
          $each: [vote]
        }
      }
    } as unknown as UpdateFilter<Logo>;

    const result = await collection.updateOne(filter, pushUpdate);

    // Get updated logo
    const updatedLogo = await collection.findOne(filter);
    if (!updatedLogo) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Logo not found after update'
        }),
        { status: 404, headers: { 'Content-Type': 'application/json' } }
      );
    }

    // Calculate new rating
    const totalVotes = updatedLogo.votes?.length || 0;
    const averageRating = totalVotes > 0
      ? (updatedLogo.votes?.reduce((sum, v) => sum + v.rating, 0) || 0) / totalVotes
      : 0;

    // Update rating
    const finalUpdate = {
      $set: {
        averageRating,
        totalVotes
      }
    } as unknown as UpdateFilter<Logo>;

    await collection.updateOne(filter, finalUpdate);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Vote recorded successfully',
        averageRating,
        totalVotes
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