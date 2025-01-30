import { NextResponse } from 'next/server'
import { connectToDatabase } from '@/app/lib/db'
import { ObjectId } from 'mongodb'
import { use } from 'react'

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = use(params)
    const { db } = await connectToDatabase()
    const userId = new ObjectId(id)

    const logos = await db
      .collection('logos')
      .find({ userId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(logos)
  } catch (error) {
    console.error('Error fetching user logos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user logos' },
      { status: 500 }
    )
  }
} 