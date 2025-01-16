import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth'
import { writeFile } from 'fs/promises'
import { join } from 'path'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json({ error: 'File must be an image' }, { status: 400 })
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: 'File size must be less than 5MB' }, { status: 400 })
    }

    // Generate a unique filename
    const buffer = await file.arrayBuffer()
    const fileExt = file.type.split('/')[1]
    const hash = crypto.createHash('sha256')
    hash.update(Buffer.from(buffer))
    hash.update(new Date().toISOString())
    const filename = `${hash.digest('hex').slice(0, 12)}.${fileExt}`

    // Create uploads directory if it doesn't exist
    const uploadDir = join(process.cwd(), 'public', 'uploads')
    try {
      await writeFile(join(uploadDir, '.keep'), '')
    } catch (error) {
      // Directory already exists
    }

    // Save the file
    await writeFile(
      join(uploadDir, filename),
      Buffer.from(await file.arrayBuffer())
    )

    // Return the URL and user ID
    return NextResponse.json({ 
      imageUrl: `/uploads/${filename}`,
      userId: session.user.id // Include the user ID in the response
    })

  } catch (error) {
    console.error('Error handling file upload:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
} 