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
const SIMILARITY_THRESHOLD = 0.70;

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
  // Basic validations
  if (!file || !file.buffer) {
    return {
      isValid: false,
      status: 400,
      error: 'Invalid file'
    };
  }

  if (!ALLOWED_FILE_TYPES.includes(file.type)) {
    return {
      isValid: false,
      status: 400,
      error: 'Invalid file type'
    };
  }

  if (file.size > MAX_FILE_SIZE) {
    return {
      isValid: false,
      status: 400,
      error: 'File size exceeds limit'
    };
  }

  const metadataResult = validateMetadata(metadata);
  if (!metadataResult.isValid) {
    return metadataResult;
  }

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
  let imageFeatures;
  try {
    imageFeatures = await extractImageFeatures(file.buffer);
  } catch (error) {
    console.error('Error extracting image features:', error);
    return {
      isValid: false,
      status: 400,
      error: 'Failed to extract image features: ' + error.message
    };
  }

  // Check for duplicates and similar images
  const duplicateCheck = await checkForDuplicates(db, {
    fileHash,
    imageFeatures,
    userId,
    allowSystemDuplicates,
    allowSimilarImages
  });

  if (!duplicateCheck.isValid) {
    return duplicateCheck;
  }

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
    // Insert the new logo
    const result = await db.collection('logos').insertOne(logo);

    if (!result.insertedId) {
      console.error('Failed to store logo: No logo ID returned');
      return {
        isValid: false,
        status: 500,
        error: 'Failed to store logo'
      };
    }

    return {
      isValid: true,
      status: 201, // Created
      logoId: result.insertedId
    };

  } catch (error) {
    if (error.code === 11000) { // Duplicate key error
      return {
        isValid: false,
        status: 409,
        error: 'You have already uploaded this logo'
      };
    }
    console.error('Error storing logo:', error);
    return {
      isValid: false,
      status: 500,
      error: 'Failed to store logo'
    };
  }
}

async function checkForDuplicates(
  db: Db,
  {
    fileHash,
    imageFeatures,
    userId,
    allowSystemDuplicates,
    allowSimilarImages
  }: {
    fileHash: string;
    imageFeatures: ImageFeatures;
    userId: string;
    allowSystemDuplicates: boolean;
    allowSimilarImages: boolean;
  }
): Promise<ValidationResult> {
  try {
    // Check for exact duplicates first
    const exactDuplicate = await db.collection('logos').findOne({ 
      fileHash,
      userId: new ObjectId(userId) // Only check user's own logos for exact duplicates
    });
    
    if (exactDuplicate) {
      return {
        isValid: false,
        status: 409,
        error: 'You have already uploaded this logo'
      };
    }
    
    // Check for system-wide duplicates if not allowed
    if (!allowSystemDuplicates) {
      const systemDuplicate = await db.collection('logos').findOne({ 
        fileHash,
        userId: { $ne: new ObjectId(userId) }
      });
      
      if (systemDuplicate) {
        return {
          isValid: false,
          status: 409,
          error: 'This logo has already been uploaded by another user'
        };
      }
    }
    
    // Check for similar images if needed
    if (!allowSimilarImages) {
      const userLogos = await db.collection('logos')
        .find({ 
          userId: new ObjectId(userId),
          _id: { $ne: exactDuplicate?._id } // Exclude the exact duplicate if it exists
        })
        .toArray();

      for (const existingLogo of userLogos) {
        if (existingLogo.imageFeatures) {
          const similarity = compareImages(imageFeatures, existingLogo.imageFeatures);
          
          if (similarity.similarity > SIMILARITY_THRESHOLD) {
            return {
              isValid: false,
              status: 409,
              error: 'Similar logo already exists in your collection',
              similarityInfo: {
                similarity: similarity.similarity,
                matchType: similarity.matchType
              }
            };
          }
        }
      }
    }

    // No duplicates found - this is a valid upload
    return {
      isValid: true,
      status: 200 // Changed from 201 since this is just a check, not the actual creation
    };
  } catch (error) {
    console.error('Error checking for duplicates:', error);
    return {
      isValid: false,
      status: 500,
      error: 'Error checking for duplicates'
    };
  }
}

// Add unique index on fileHash and userId to handle concurrent uploads
export async function createLogoIndexes(db: Db): Promise<void> {
  await db.collection('logos').createIndex(
    { fileHash: 1, userId: 1 },
    { unique: true }
  );
}