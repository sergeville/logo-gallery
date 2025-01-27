import { MongoClient } from 'mongodb'
import type { Logo } from '@/lib/types'
import { generateSyncReport } from './check-logo-sync';
import { connectToDatabase } from '@/lib/mongodb';
import { ObjectId } from 'mongodb';
import { join } from 'path';
import chalk from 'chalk';
import { stat, mkdir } from 'fs/promises';

interface FileInfo {
  size: number;
  created: Date;
}

async function getFileInfo(filePath: string): Promise<FileInfo> {
  const stats = await stat(filePath);
  return {
    size: stats.size,
    created: stats.birthtime
  };
}

async function ensureUploadsDir() {
  const uploadsDir = join(process.cwd(), 'public', 'uploads');
  try {
    await mkdir(uploadsDir, { recursive: true });
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') {
      throw error;
    }
  }
}

async function syncToLocal() {
  const sourceClient = new MongoClient(process.env.MONGODB_SOURCE_URI || '')
  const targetClient = new MongoClient(process.env.MONGODB_TARGET_URI || '')
  
  try {
    await sourceClient.connect()
    await targetClient.connect()
    
    const sourceDb = sourceClient.db(process.env.MONGODB_SOURCE_DB || 'logo-gallery')
    const targetDb = targetClient.db(process.env.MONGODB_TARGET_DB || 'logo-gallery')
    
    // Get logos from source
    const sourceLogos = await sourceDb.collection<Logo>('logos').find().toArray()
    console.log(`Found ${sourceLogos.length} logos in source database`)
    
    // Clear target logos collection
    await targetDb.collection('logos').deleteMany({})
    
    if (sourceLogos.length > 0) {
      // Insert logos into target
      const result = await targetDb.collection('logos').insertMany(sourceLogos)
      console.log(`Successfully synced ${result.insertedCount} logos to target database`)
    }
    
    console.log('Sync completed successfully')
  } catch (error) {
    console.error('Error during sync:', error)
  } finally {
    await sourceClient.close()
    await targetClient.close()
  }
}

// Run if called directly
if (require.main === module) {
  syncToLocal().catch(console.error)
}

export { syncToLocal }; 