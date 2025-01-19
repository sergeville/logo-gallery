import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase();
    const logo = await db.collection('logos').findOne({
      _id: new ObjectId(params.id),
    });

    if (!logo) {
      return new NextResponse('Logo not found', { status: 404 });
    }

    return NextResponse.json(logo);
  } catch (error) {
    console.error('Error fetching logo:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
} 