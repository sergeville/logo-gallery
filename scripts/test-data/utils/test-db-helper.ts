import { MongoClient, Db, Collection, ClientSession, ObjectId } from 'mongodb';

interface BaseDocument {
  _id?: ObjectId;
  [key: string]: any;
}

export class TestDbHelper {
  private client: MongoClient | null = null;
  private db: Db | null = null;
  private session: ClientSession | null = null;

  constructor(private readonly uri: string = process.env.MONGODB_URI || 'mongodb://localhost:27017/test') {}

  async connect(): Promise<void> {
    if (!this.client) {
      this.client = await MongoClient.connect(this.uri);
      this.db = this.client.db();
    }
  }

  async disconnect(): Promise<void> {
    if (this.session) {
      await this.session.endSession();
      this.session = null;
    }
    if (this.client) {
      await this.client.close();
      this.client = null;
      this.db = null;
    }
  }

  async startTransaction(): Promise<void> {
    if (!this.client) {
      await this.connect();
    }
    if (this.session) {
      await this.session.endSession();
    }
    this.session = this.client!.startSession();
    await this.session.startTransaction();
  }

  async commitTransaction(): Promise<void> {
    if (this.session) {
      await this.session.commitTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  async rollbackTransaction(): Promise<void> {
    if (this.session) {
      await this.session.abortTransaction();
      await this.session.endSession();
      this.session = null;
    }
  }

  async insertUser(user: BaseDocument): Promise<BaseDocument> {
    if (!this.db) await this.connect();
    const collection = this.db!.collection('users');
    const result = await collection.insertOne(user, { session: this.session || undefined });
    return { ...user, _id: result.insertedId };
  }

  async updateUser(id: string | ObjectId, update: Partial<BaseDocument>): Promise<BaseDocument | null> {
    if (!this.db) await this.connect();
    const collection = this.db!.collection('users');
    const _id = typeof id === 'string' ? new ObjectId(id) : id;
    const result = await collection.findOneAndUpdate(
      { _id },
      { $set: update },
      { returnDocument: 'after', session: this.session || undefined }
    );
    return result?.value ?? null;
  }

  async findUser(query: Partial<BaseDocument>): Promise<BaseDocument | null> {
    if (!this.db) await this.connect();
    const collection = this.db!.collection('users');
    return collection.findOne(query, { session: this.session || undefined });
  }

  async clearCollection(collectionName: string): Promise<void> {
    if (!this.db) await this.connect();
    await this.db!.collection(collectionName).deleteMany({}, { session: this.session || undefined });
  }

  async createIndexes(): Promise<void> {
    if (!this.db) await this.connect();
    const usersCollection = this.db!.collection('users');
    await usersCollection.createIndex({ email: 1 }, { unique: true });
  }

  getCollection<TSchema extends { [key: string]: any; } = Document>(name: string): Collection<TSchema> {
    if (!this.db) {
      throw new Error('Database not connected. Call connect() first.');
    }
    return this.db.collection<TSchema>(name);
  }

  async clearDatabase(): Promise<void> {
    if (!this.db) await this.connect();
    const collections = await this.db!.collections();
    for (const collection of collections) {
      await collection.deleteMany({}, { session: this.session || undefined });
    }
  }

  async bulkInsertUsers(users: BaseDocument[]): Promise<BaseDocument[]> {
    if (!this.db) await this.connect();
    const collection = this.db!.collection('users');
    const result = await collection.insertMany(users, { session: this.session || undefined });
    return users.map((user, index) => ({
      ...user,
      _id: result.insertedIds[index]
    }));
  }
} 