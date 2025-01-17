import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/api/auth/[...nextauth]/options';
import connectDB from '@/app/lib/db';
import { Logo } from '@/app/lib/models/logo';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { logoId } = await request.json();
    if (!logoId) {
      return NextResponse.json({ error: 'Logo ID is required' }, { status: 400 });
    }

    await connectDB();
    const logo = await Logo.findById(logoId);
    
    if (!logo) {
      return NextResponse.json({ error: 'Logo not found' }, { status: 404 });
    }

    // Check if user has already voted
    const existingVote = logo.votes.find(
      (vote: any) => vote.userId.toString() === session.user.id
    );

    if (existingVote) {
      // Remove existing vote
      logo.votes = logo.votes.filter(
        (vote: any) => vote.userId.toString() !== session.user.id
      );
    } else {
      // Add new vote
      logo.votes.push({
        userId: session.user.id,
        createdAt: new Date()
      });
    }

    // Update total votes count
    logo.totalVotes = logo.votes.length;
    await logo.save();

    return NextResponse.json({
      message: existingVote ? 'Vote removed' : 'Vote added',
      totalVotes: logo.totalVotes,
      isVoted: !existingVote
    });
  } catch (error) {
    console.error('Error processing vote:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 