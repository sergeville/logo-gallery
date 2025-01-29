import { Collection } from 'mongodb';
import { MigrationHelper, MigrationOptions } from '@/scripts/migrations/migration-helper';

export abstract class BaseMigration {
  protected helper: MigrationHelper;
  protected options: MigrationOptions;

  constructor(
    protected uri: string,
    protected dbName: string,
    options: MigrationOptions = {}
  ) {
    this.helper = new MigrationHelper(uri, dbName);
    this.options = {
      backupBeforeMigration: true,
      batchSize: 100,
      ...options
    };
  }

  abstract get name(): string;
  abstract get description(): string;

  protected abstract validatePreConditions(): Promise<boolean>;
  protected abstract performMigration(): Promise<void>;
  protected abstract validatePostConditions(): Promise<boolean>;

  async migrate(): Promise<boolean> {
    try {
      await this.helper.connect();

      // Validate pre-conditions
      if (!await this.validatePreConditions()) {
        throw new Error('Pre-migration validation failed');
      }

      // Create backups if needed
      const backups = new Map<string, string>();
      if (this.options.backupBeforeMigration) {
        for (const collection of await this.getAffectedCollections()) {
          const backupName = await this.helper.backupCollection(collection);
          backups.set(collection, backupName);
        }
      }

      try {
        // Perform migration
        await this.performMigration();

        // Validate post-conditions
        if (!await this.validatePostConditions()) {
          throw new Error('Post-migration validation failed');
        }

        return true;
      } catch (error) {
        // Rollback if needed
        if (this.options.backupBeforeMigration) {
          for (const [collection, backup] of Array.from(backups.entries())) {
            await this.helper.rollbackFromBackup(backup, collection);
          }
        }
        throw error;
      }
    } catch (error) {
      console.error(`Migration failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    } finally {
      await this.helper.disconnect();
    }
  }

  protected abstract getAffectedCollections(): Promise<string[]>;

  protected async validateCollection(
    collection: Collection,
    validator: (doc: any) => boolean
  ): Promise<boolean> {
    return this.helper.validateMigration(collection, validator);
  }
} 