import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import connectDB from '@/app/lib/db'
import { Logo } from '@/app/lib/models/logo'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

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
    const file = formData.get('file') as File
    const name = formData.get('name') as string
    const description = formData.get('description') as string
    const tags = (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean)

    if (!file || !name) {
      return NextResponse.json(
        { error: 'File and name are required' },
        { status: 400 }
      )
    }

    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { error: 'File size must be less than 5MB' },
        { status: 400 }
      )
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${session.user.id}-${timestamp}-${file.name}`
    const thumbnailFilename = `${session.user.id}-${timestamp}-thumb-${file.name}`

    // Save original file
    const filePath = join(UPLOAD_DIR, filename)
    await writeFile(filePath, buffer)

    // Generate and save thumbnail
    const thumbnailPath = join(UPLOAD_DIR, thumbnailFilename)
    await sharp(buffer)
      .resize(300, 300, {
        fit: 'inside',
        withoutEnlargement: true
      })
      .toFile(thumbnailPath)

    // Get image dimensions
    const metadata = await sharp(buffer).metadata()

    await connectDB()
    const logo = new Logo({
      name,
      description,
      url: `/uploads/${filename}`,
      imageUrl: `/uploads/${filename}`,
      thumbnailUrl: `/uploads/${thumbnailFilename}`,
      ownerId: session.user.id,
      ownerName: session.user.name,
      category: 'uncategorized',
      tags,
      dimensions: {
        width: metadata.width,
        height: metadata.height
      },
      fileSize: file.size,
      fileType: file.type,
      uploadedAt: new Date(),
      totalVotes: 0,
      averageRating: 0,
      votes: []
    })

    await logo.save()

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logo: {
        id: logo._id,
        name: logo.name,
        imageUrl: logo.imageUrl
      }
    }, { status: 201 })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload logo' },
      { status: 500 }
    )
  }
} 