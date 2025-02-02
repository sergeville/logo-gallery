import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';

interface UploadedFile {
  name: string;
  size: number;
  type: string;
  buffer: Buffer;
}

interface LogoUploadInput {
  file: UploadedFile;
  userId: string;
  title: string;
  tags: string[];
}

export interface LogoUploadResult {
  status: number;
  logo?: {
    _id: string;
    title: string;
    userId: string;
    fileUrl: string;
    tags: string[];
    createdAt: Date;
  };
  error?: string;
}

interface Logo {
  _id: string;
  title: string;
  userId: string;
  fileUrl: string;
  tags: string[];
  createdAt: Date;
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export async function uploadLogo(input: LogoUploadInput): Promise<LogoUploadResult> {
  // Validate file size
  if (input.file.size > MAX_FILE_SIZE) {
    return {
      status: 400,
      error: 'File size exceeds the 2MB limit'
    };
  }

  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(input.file.type)) {
    return {
      status: 400,
      error: 'Invalid file type. Only PNG, JPG, and SVG files are allowed'
    };
  }

  const { db } = await connectToDatabase();

  // In a real implementation, we would:
  // 1. Upload the file to cloud storage (e.g., S3)
  // 2. Get the URL of the uploaded file
  // For testing, we'll create a mock URL
  const mockFileUrl = `https://storage.example.com/logos/${input.file.name}`;

  // Store logo metadata in database
  const result = await db.collection('logos').insertOne({
    title: input.title,
    userId: input.userId,
    fileUrl: mockFileUrl,
    tags: input.tags,
    createdAt: new Date(),
    fileName: input.file.name,
    fileType: input.file.type,
    fileSize: input.file.size
  });

  return {
    status: 201,
    logo: {
      _id: result.insertedId.toString(),
      title: input.title,
      userId: input.userId,
      fileUrl: mockFileUrl,
      tags: input.tags,
      createdAt: new Date()
    }
  };
}

export async function getLogo(logoId: string): Promise<Logo | null> {
  const { db } = await connectToDatabase();

  try {
    const logo = await db.collection('logos').findOne({
      _id: new ObjectId(logoId)
    });

    if (!logo) {
      return null;
    }

    return {
      _id: logo._id.toString(),
      title: logo.title,
      userId: logo.userId,
      fileUrl: logo.fileUrl,
      tags: logo.tags,
      createdAt: logo.createdAt
    };
  } catch (error) {
    // Handle invalid ObjectId
    return null;
  }
} 