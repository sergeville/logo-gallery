import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '../auth/[...nextauth]/options'
import connectDB from '@/app/lib/db'
import { Logo } from '@/app/lib/models/logo'
import mongoose from 'mongoose'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import { v4 as uuidv4 } from 'uuid'
import sharp from 'sharp'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const name = formData.get('name') as string
    const description = formData.get('description') as string || ''
    const tags = (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean)
    const file = formData.get('file') as File

    if (!name || !file) {
      return NextResponse.json(
        { error: 'Name and file are required' },
        { status: 400 }
      )
    }

    // Generate unique filename
    const ext = file.name.split('.').pop()
    const filename = `${uuidv4()}.${ext}`
    const uploadDir = join(process.cwd(), 'public', 'uploads')

    // Save file and get dimensions
    try {
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      
      // Get image dimensions using sharp
      const metadata = await sharp(buffer).metadata()
      const dimensions = {
        width: metadata.width || 0,
        height: metadata.height || 0
      }
      
      // Save the file
      await writeFile(join(uploadDir, filename), buffer)

      await connectDB()

      const logo = new Logo({
        name,
        description,
        imageUrl: `/uploads/${filename}`,
        thumbnailUrl: `/uploads/${filename}`, // In production, you'd generate a real thumbnail
        ownerId: session.user.id,
        ownerName: session.user.name || 'Anonymous',
        category: 'uncategorized', // Default category
        tags,
        dimensions,
        fileSize: buffer.length,
        fileType: ext,
        uploadedAt: new Date(),
        totalVotes: 0,
        averageRating: 0,
        votes: []
      })

      await logo.save()

      return NextResponse.json(
        { message: 'Logo uploaded successfully', logo },
        { status: 201 }
      )
    } catch (error) {
      console.error('Error saving file:', error)
      return NextResponse.json(
        { error: 'Error saving file' },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error uploading logo:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
} 