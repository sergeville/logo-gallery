import { MongoClient, Db, Collection, Document } from 'mongodb';
import { createLogger, format, transports } from 'winston';

export interface MigrationOptions {
  backupBeforeMigration?: boolean;
  progressCallback?: (progress: number, message: string) => void;
  batchSize?: number;
}

export class MigrationHelper {
  private db!: Db;
  private client!: MongoClient;
  private logger: any;

  constructor(private uri: string, private dbName: string) {
    this.logger = createLogger({
      format: format.combine(
        format.timestamp(),
        format.json()
      ),
      transports: [
        new transports.File({ filename: 'migration.log' }),
        new transports.Console()
      ]
    });
  }

  async connect(): Promise<void> {
    this.client = await MongoClient.connect(this.uri);
    this.db = this.client.db(this.dbName);
    this.logger.info('Connected to database');
  }

  async disconnect(): Promise<void> {
    await this.client.close();
    this.logger.info('Disconnected from database');
  }

  async backupCollection(collectionName: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const backupName = `${collectionName}_backup_${timestamp}`;
    
    this.logger.info(`Creating backup of ${collectionName} as ${backupName}`);
    
    // Create backup collection
    await this.db.createCollection(backupName);
    const sourceCollection = this.db.collection(collectionName);
    const backupCollection = this.db.collection(backupName);
    
    // Copy all documents
    const documents = await sourceCollection.find({}).toArray();
    if (documents.length > 0) {
      await backupCollection.insertMany(documents);
    }
    
    this.logger.info(`Backup completed: ${documents.length} documents copied`);
    return backupName;
  }

  async rollbackFromBackup(backupName: string, targetCollection: string): Promise<void> {
    this.logger.info(`Rolling back ${targetCollection} from ${backupName}`);
    
    const backupCollection = this.db.collection(backupName);
    const targetColl = this.db.collection(targetCollection);
    
    // Clear target collection
    await targetColl.deleteMany({});
    
    // Restore from backup
    const documents = await backupCollection.find({}).toArray();
    if (documents.length > 0) {
      await targetColl.insertMany(documents);
    }
    
    this.logger.info(`Rollback completed: ${documents.length} documents restored`);
  }

  async processBatch<T, U extends Document = T & Document>(
    collection: Collection<U>,
    query: object,
    processor: (doc: T) => Promise<U>,
    options: MigrationOptions = {}
  ): Promise<void> {
    const batchSize = options.batchSize || 100;
    let processed = 0;
    let total = await collection.countDocuments(query);
    
    const cursor = collection.find(query).batchSize(batchSize);
    let batch: U[] = [];
    
    this.logger.info(`Starting batch processing of ${total} documents`);
    
    while (await cursor.hasNext()) {
      const doc = await cursor.next() as T;
      const processedDoc = await processor(doc);
      batch.push(processedDoc);
      
      if (batch.length >= batchSize) {
        await this.saveBatch(collection, batch);
        processed += batch.length;
        batch = [];
        
        const progress = (processed / total) * 100;
        this.logger.info(`Processed ${processed}/${total} documents (${progress.toFixed(2)}%)`);
        
        if (options.progressCallback) {
          options.progressCallback(progress, `Processed ${processed}/${total} documents`);
        }
      }
    }
    
    // Process remaining documents
    if (batch.length > 0) {
      await this.saveBatch(collection, batch);
      processed += batch.length;
      
      if (options.progressCallback) {
        options.progressCallback(100, `Completed processing ${processed} documents`);
      }
    }
    
    this.logger.info(`Batch processing completed: ${processed} documents processed`);
  }

  private async saveBatch<T extends Document>(collection: Collection<T>, batch: T[]): Promise<void> {
    if (batch.length === 0) return;
    
    try {
      const operations = batch.map(doc => ({
        replaceOne: {
          filter: { _id: doc._id },
          replacement: doc,
          upsert: true
        }
      }));
      
      await collection.bulkWrite(operations);
    } catch (error) {
      this.logger.error('Error saving batch:', error);
      throw error;
    }
  }

  async validateMigration(
    collection: Collection,
    validator: (doc: any) => boolean
  ): Promise<boolean> {
    let isValid = true;
    const cursor = collection.find({});
    
    while (await cursor.hasNext()) {
      const doc = await cursor.next();
      if (!validator(doc)) {
        this.logger.error(`Validation failed for document:`, doc);
        isValid = false;
      }
    }
    
    return isValid;
  }
} 