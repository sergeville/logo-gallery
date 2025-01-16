import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/db';
import { Logo, ClientLogo } from '@/app/lib/types';
import { WithId } from 'mongodb';

function transformLogo(doc: WithId<Logo>): ClientLogo {
  if (!doc) {
    throw new Error('Invalid logo document');
  }

  return {
    id: doc._id.toString(),
    name: doc.name,
    description: doc.description || '',
    url: doc.url,
    imageUrl: doc.imageUrl,
    thumbnailUrl: doc.thumbnailUrl,
    userId: doc.userId.toString(),
    ownerName: doc.ownerName,
    tags: doc.tags,
    totalVotes: doc.totalVotes,
    votes: doc.votes.map(vote => ({
      userId: vote.userId.toString(),
      rating: vote.rating,
      timestamp: vote.timestamp.toISOString()
    })),
    createdAt: doc.createdAt.toISOString(),
    updatedAt: doc.updatedAt.toISOString()
  };
}

export async function GET() {
  try {
    const { db } = await connectToDatabase();
    const logos = await db.collection<Logo>('logos')
      .find()
      .sort({ createdAt: -1 })
      .toArray();

    const transformedLogos = logos.map(logo => {
      try {
        return transformLogo(logo);
      } catch (error) {
        console.error('Error transforming logo:', error, logo);
        return null;
      }
    }).filter(Boolean);

    return NextResponse.json({
      logos: transformedLogos,
      pagination: {
        current: 1,
        total: Math.ceil(logos.length / 10),
        hasMore: logos.length > 10
      }
    });

  } catch (error) {
    console.error('Error in logos API:', error);
    return NextResponse.json(
      { message: 'Failed to fetch logos' },
      { status: 500 }
    );
  }
} 