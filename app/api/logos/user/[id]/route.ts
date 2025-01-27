import { NextResponse } from 'next/server'
import { connectToDatabase } from '../../../../../lib/db'
import { ObjectId } from 'mongodb'
import { Logo } from '../../../../../lib/types'
import { transformLogo } from '../../../../../lib/transforms'

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { db } = await connectToDatabase()
    const ownerId = new ObjectId(params.id)

    const logos = await db
      .collection<Logo>('logos')
      .find({ ownerId })
      .sort({ createdAt: -1 })
      .toArray()

    return NextResponse.json(logos.map(logo => transformLogo(logo)))
  } catch (error) {
    console.error('Error fetching user logos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch user logos' },
      { status: 500 }
    )
  }
} 