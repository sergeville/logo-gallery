import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/api/auth/[...nextauth]/options'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import sharp from 'sharp'
import connectDB from '@/app/lib/db'
import { Logo } from '@/app/lib/models/logo'
import dbConnect from '@/app/lib/db-config'

const UPLOAD_DIR = join(process.cwd(), 'public', 'uploads')
const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml']

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'You must be signed in to upload logos' },
        { status: 401 }
      )
    }

    const formData = await request.formData()
    const file = formData.get('file') as File
    const title = formData.get('title') as string
    const description = formData.get('description') as string
    const tags = (formData.get('tags') as string || '').split(',').map(tag => tag.trim()).filter(Boolean)

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    if (!title || title.length < 3 || title.length > 60) {
      return NextResponse.json(
        { error: 'Title must be between 3 and 60 characters' },
        { status: 400 }
      )
    }

    if (!description || description.length < 10 || description.length > 200) {
      return NextResponse.json(
        { error: 'Description must be between 10 and 200 characters' },
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
        { error: 'Invalid file type. Please upload a JPEG, PNG, SVG, or WebP image.' },
        { status: 400 }
      )
    }

    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Generate unique filename
    const timestamp = Date.now()
    const filename = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`
    const thumbnailFilename = `${timestamp}-thumb-${file.name.replace(/[^a-zA-Z0-9.-]/g, '')}`

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
      title: title.trim(),
      description: description.trim(),
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
      uploadedAt: new Date()
    })

    await logo.save()

    return NextResponse.json({
      message: 'Logo uploaded successfully',
      logo: {
        _id: logo._id,
        title: logo.title,
        description: logo.description,
        imageUrl: logo.imageUrl,
        userId: logo.userId,
        createdAt: logo.createdAt
      }
    }, { status: 201 })
  } catch (error: unknown) {
    console.error('Upload error:', error)
    const message = error instanceof Error ? error.message : 'Failed to upload logo'
    return NextResponse.json(
      { error: message },
      { status: 500 }
    )
  }
} 