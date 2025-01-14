import { Collection as MongoCollection } from 'mongodb';
import { BaseMigration } from './base-migration';

interface OldCollection {
  _id: any;
  name: string;
  description: string;
  userId: any;
  logoIds: any[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  collaborators?: any[];
}

interface NewCollection {
  _id: any;
  name: string;
  description: string;
  userId: any;
  logos: any[];
  isPublic: boolean;
  createdAt: Date;
  updatedAt: Date;
  tags?: string[];
  collaborators?: any[];
}

export class UpdateCollectionSchemaMigration extends BaseMigration {
  get name(): string {
    return '001-update-collection-schema';
  }

  get description(): string {
    return 'Updates Collection schema to use logos instead of logoIds';
  }

  protected async validatePreConditions(): Promise<boolean> {
    const db = this.helper['db'];
    const collections = db.collection('collections');
    
    // Check if we have any collections using the old schema
    const oldSchemaCount = await collections.countDocuments({
      logoIds: { $exists: true }
    });

    return oldSchemaCount > 0;
  }

  protected async performMigration(): Promise<void> {
    const db = this.helper['db'];
    const collections = db.collection<NewCollection>('collections');

    await this.helper.processBatch<OldCollection, NewCollection>(
      collections,
      { logoIds: { $exists: true } },
      async (doc: OldCollection): Promise<NewCollection> => {
        const { logoIds, ...rest } = doc;
        return {
          ...rest,
          logos: logoIds,
          updatedAt: new Date()
        };
      },
      {
        batchSize: this.options.batchSize,
        progressCallback: this.options.progressCallback
      }
    );
  }

  protected async validatePostConditions(): Promise<boolean> {
    const db = this.helper['db'];
    const collections = db.collection('collections');

    // Verify all documents have been migrated
    const oldSchemaCount = await collections.countDocuments({
      logoIds: { $exists: true }
    });

    const newSchemaCount = await collections.countDocuments({
      logos: { $exists: true }
    });

    // All documents should have the new schema
    return oldSchemaCount === 0 && newSchemaCount > 0;
  }

  protected async getAffectedCollections(): Promise<string[]> {
    return ['collections'];
  }
} 