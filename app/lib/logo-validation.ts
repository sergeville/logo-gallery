import { connectToDatabase } from './db-config';
import { ObjectId } from 'mongodb';
import { createHash } from 'crypto';
import { extractImageFeatures, compareImages, ImageFeatures } from './image-similarity';
import { Db } from 'mongodb';

interface LogoMetadata {
  width: number;
  height: number;
}

interface UploadedFile {
  name: string;
  type: string;
  size: number;
  buffer: Buffer;
  stream?: () => void;
  arrayBuffer?: () => Promise<Buffer>;
  text?: () => Promise<string>;
}

interface ValidationResult {
  isValid: boolean;
  status: number;
  error?: string;
  logoId?: ObjectId;
  similarityInfo?: {
    similarity: number;
    matchType: string;
    similarLogos?: Array<{
      logoId: ObjectId;
      similarity: number;
      matchType: string;
    }>;
  };
}

interface DuplicateCheckResult {
  isDuplicate: boolean;
  existingLogoId?: ObjectId;
  ownedByUser: boolean;
  similarityInfo?: {
    similarity: number;
    matchType: string;
  };
}

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB
const ALLOWED_FILE_TYPES = ['image/png', 'image/jpeg', 'image/svg+xml'];
const MIN_DIMENSION = 1;
const MAX_DIMENSION = 10000; // reasonable max dimension
const SIMILARITY_THRESHOLD = 0.85;

function validateMetadata(metadata: LogoMetadata): ValidationResult {
  if (!metadata || typeof metadata !== 'object') {
    return {
      isValid: false,
      status: 400,
      error: 'Invalid image metadata'
    };
  }

  if (!Number.isInteger(metadata.width) || !Number.isInteger(metadata.height)) {
    return {
      isValid: false,
      status: 400,
      error: 'Invalid image metadata'
    };
  }

  if (metadata.width < MIN_DIMENSION || metadata.height < MIN_DIMENSION ||
      metadata.width > MAX_DIMENSION || metadata.height > MAX_DIMENSION) {
    return {
      isValid: false,
      status: 400,
      error: 'Invalid image dimensions'
    };
  }

  return { isValid: true, status: 200 };
}

async function validateUser(userId: string): Promise<ValidationResult> {
  if (!ObjectId.isValid(userId)) {
    return {
      isValid: false,
      status: 400,
      error: 'Invalid user ID'
    };
  }

  const { db } = await connectToDatabase();
  if (!db) {
    return {
      isValid: false,
      status: 500,
      error: 'Database connection failed'
    };
  }

  const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });

  if (!user) {
    return {
      isValid: false,
      status: 404,
      error: 'User not found'
    };
  }

  return { isValid: true, status: 200 };
}

// Add function to generate file hash
function generateFileHash(buffer: Buffer): string {
  return createHash('sha256').update(new Uint8Array(buffer)).digest('hex');
}

export async function validateLogoUpload({
  file,
  metadata,
  userId,
  allowSystemDuplicates = true,
  allowSimilarImages = false
}: {
  file: UploadedFile;
  metadata: LogoMetadata;
  userId: string;
  allowSystemDuplicates?: boolean;
  allowSimilarImages?: boolean;
}): Promise<ValidationResult> {
  // Validate file type
  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      status: 400,
      error: 'Invalid file type'
    };
  }

  // Validate file size
  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      status: 400,
      error: 'File size exceeds limit'
    };
  }

  // Validate metadata
  const metadataResult = validateMetadata(metadata);
  if (!metadataResult.isValid) {
    return metadataResult;
  }

  // Validate user
  const userResult = await validateUser(userId);
  if (!userResult.isValid) {
    return userResult;
  }

  const { db } = await connectToDatabase();
  if (!db) {
    return {
      isValid: false,
      status: 500,
      error: 'Database connection failed'
    };
  }

  // Generate file hash
  const fileHash = generateFileHash(file.buffer);

  // Extract image features
  const imageFeatures = await extractImageFeatures(file.buffer);

  // Check for duplicates and similar images first
  const existingLogos = await db.collection('logos').find({}).toArray();
  
  // If this is the first upload, allow it
  if (existingLogos.length === 0) {
    // Prepare logo document
    const logo = {
      userId: new ObjectId(userId),
      name: file.name,
      file: {
        name: file.name,
        type: file.type,
        size: file.size,
        data: file.buffer
      },
      metadata,
      fileHash,
      imageFeatures,
      createdAt: new Date()
    };

    try {
      const result = await db.collection('logos').insertOne(logo);
      return {
        isValid: true,
        status: 201,
        logoId: result.insertedId
      };
    } catch (error) {
      return {
        isValid: false,
        status: 500,
        error: 'Failed to store logo'
      };
    }
  }

  // Check for duplicates and similar images
  let hasDuplicate = false;
  let duplicateFromSameUser = false;

  for (const existingLogo of existingLogos) {
    // Check for exact duplicates by hash
    if (existingLogo.fileHash === fileHash) {
      hasDuplicate = true;
      duplicateFromSameUser = existingLogo.userId.toString() === userId;
      
      // If it's from the same user, reject
      if (duplicateFromSameUser) {
        return {
          isValid: false,
          status: 409,
          error: 'Duplicate file detected'
        };
      }
      
      // If system duplicates aren't allowed, reject
      if (!allowSystemDuplicates) {
        return {
          isValid: false,
          status: 409,
          error: 'Duplicate file detected'
        };
      }
      // If we get here, it's a duplicate from a different user but allowSystemDuplicates is true
      // So we continue to the next logo
      continue;
    }

    // Check for similar images (only if it's from the same user)
    if (existingLogo.userId.toString() === userId && 
        !allowSimilarImages && 
        existingLogo.imageFeatures) {
      const similarity = compareImages(imageFeatures, existingLogo.imageFeatures);
      if (similarity.similarity > SIMILARITY_THRESHOLD) {
        return {
          isValid: false,
          status: 400,
          error: 'Similar image detected',
          similarityInfo: {
            similarity: similarity.similarity,
            matchType: similarity.matchType
          }
        };
      }
    }
  }

  // If we get here, either:
  // 1. No duplicates found
  // 2. Found duplicate but from different user and allowSystemDuplicates is true
  // 3. Found similar image but from different user
  // In all cases, we should allow the upload

  // Prepare logo document
  const logo = {
    userId: new ObjectId(userId),
    name: file.name,
    file: {
      name: file.name,
      type: file.type,
      size: file.size,
      data: file.buffer
    },
    metadata,
    fileHash,
    imageFeatures,
    createdAt: new Date()
  };

  try {
    const result = await db.collection('logos').insertOne(logo);
    return {
      isValid: true,
      status: 201,
      logoId: result.insertedId
    };
  } catch (error) {
    // Check if it's a duplicate key error
    if (error && typeof error === 'object' && 'code' in error && error.code === 11000) {
      return {
        isValid: false,
        status: 409,
        error: 'Duplicate file detected'
      };
    }
    return {
      isValid: false,
      status: 500,
      error: 'Failed to store logo'
    };
  }
}