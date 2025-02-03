import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
  stream?: () => void;
  arrayBuffer?: () => Promise<Buffer>;
  text?: () => Promise<string>;
}

interface UploadLogoInput {
  file: UploadedFile;
  title: string;
  description?: string;
  tags: string[];
  userId: string;
}

interface LogoResult {
  status: number;
  logo?: any;
  error?: string;
}

interface Logo {
  _id: string;
  title: string;
  description: string;
  tags: string[];
  createdAt: string;
  userId: string;
  url: string;
}

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];

export async function uploadLogo(input: UploadLogoInput): Promise<LogoResult> {
  const { db } = await connectToDatabase();

  if (!db) {
    return {
      status: 500,
      error: 'Database connection failed'
    };
  }

  // Validate file
  if (!input.file) {
    return {
      status: 400,
      error: 'No file provided'
    };
  }

  if (input.file.size > MAX_FILE_SIZE) {
    return {
      status: 400,
      error: 'File size exceeds limit'
    };
  }

  if (!ALLOWED_FILE_TYPES.includes(input.file.type)) {
    return {
      status: 400,
      error: 'Invalid file type'
    };
  }

  try {
    const logo = {
      title: input.title,
      description: input.description || '',
      tags: input.tags,
      userId: input.userId,
      file: {
        name: input.file.name,
        type: input.file.type,
        size: input.file.size,
        data: input.file.buffer
      },
      name: input.file.name,
      createdAt: new Date().toISOString()
    };

    const result = await db.collection('logos').insertOne(logo);
    
    return {
      status: 201,
      logo: { ...logo, _id: result.insertedId }
    };
  } catch (error) {
    return {
      status: 500,
      error: 'Failed to upload logo'
    };
  }
}

export async function getLogo(logoId: string): Promise<Logo | null> {
  const { db } = await connectToDatabase();

  if (!db) {
    return null;
  }

  try {
    const logo = await db.collection('logos').findOne({ _id: new ObjectId(logoId) });
    
    if (!logo) {
      return null;
    }

    return {
      _id: logo._id.toString(),
      title: logo.title,
      description: logo.description,
      tags: logo.tags,
      userId: logo.userId,
      createdAt: logo.createdAt,
      file: {
        name: logo.file.name,
        type: logo.file.type,
        size: logo.file.size,
        data: logo.file.data
      }
    };
  } catch (error) {
    return null;
  }
} 