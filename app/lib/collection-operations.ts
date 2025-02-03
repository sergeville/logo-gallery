import { ObjectId } from 'mongodb';
import { connectToDatabase } from './db-config';

type CollectionCategory = 'personal' | 'work' | 'inspiration' | 'project';
type CollectionPermission = 'view' | 'edit' | 'manage';

interface CollectionDocument {
  _id: string;
  name: string;
  description: string;
  userId: string;
  category: CollectionCategory;
  isPublic: boolean;
  logos: string[];
  sharedWith: Array<{
    userId: string;
    permissions: CollectionPermission[];
  }>;
  createdAt: string;
  updatedAt: string;
}

interface CreateCollectionInput {
  name: string;
  description: string;
  userId: string;
  category: CollectionCategory;
  isPublic: boolean;
}

interface UpdateCollectionInput {
  name?: string;
  description?: string;
  category?: CollectionCategory;
}

interface ShareCollectionInput {
  sharedWith: string[];
  permissions: CollectionPermission[];
}

interface CollectionResult {
  status: number;
  collection: CollectionDocument | null;
}

interface CollectionsResult {
  status: number;
  collections: CollectionDocument[];
  total: number;
}

interface SuccessResult {
  status: number;
  success: boolean;
}

export async function createCollection(input: CreateCollectionInput): Promise<CollectionResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, collection: null };
  }

  const collection = {
    ...input,
    _id: new ObjectId().toString(),
    logos: [],
    sharedWith: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('collections').insertOne({
    ...collection,
    _id: new ObjectId(collection._id)
  });

  return { status: 200, collection };
}

export async function updateCollection(
  collectionId: string,
  userId: string,
  updates: UpdateCollectionInput
): Promise<CollectionResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, collection: null };
  }

  const existingCollection = await db.collection('collections').findOne({
    _id: new ObjectId(collectionId),
    userId,
  });

  if (!existingCollection) {
    return { status: 404, collection: null };
  }

  const updatedCollection = {
    ...existingCollection,
    ...updates,
    _id: existingCollection._id.toString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('collections').updateOne(
    { _id: new ObjectId(collectionId) },
    { $set: { ...updates, updatedAt: updatedCollection.updatedAt } }
  );

  return { status: 200, collection: updatedCollection as CollectionDocument };
}

export async function deleteCollection(
  collectionId: string,
  userId: string
): Promise<SuccessResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, success: false };
  }

  const result = await db.collection('collections').deleteOne({
    _id: new ObjectId(collectionId),
    userId,
  });

  return { status: 200, success: result.deletedCount > 0 };
}

export async function getCollection(collectionId: string): Promise<CollectionResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, collection: null };
  }

  const collection = await db.collection('collections').findOne({
    _id: new ObjectId(collectionId),
  });

  if (!collection) {
    return { status: 404, collection: null };
  }

  return {
    status: 200,
    collection: {
      ...collection,
      _id: collection._id.toString(),
    } as CollectionDocument
  };
}

export async function getCollections(
  userId: string,
  options: { page: number; limit: number; category?: CollectionCategory }
): Promise<CollectionsResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, collections: [], total: 0 };
  }

  const query = { userId, ...(options.category && { category: options.category }) };

  const total = await db.collection('collections').countDocuments(query);

  const collections = await db
    .collection('collections')
    .find(query)
    .sort({ updatedAt: -1 })
    .skip((options.page - 1) * options.limit)
    .limit(options.limit)
    .toArray();

  return {
    status: 200,
    collections: collections.map(col => ({
      ...col,
      _id: col._id.toString(),
    })) as CollectionDocument[],
    total,
  };
}

export async function addLogoToCollection(
  collectionId: string,
  logoId: string,
  userId: string
): Promise<SuccessResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, success: false };
  }

  const collection = await db.collection('collections').findOne({
    _id: new ObjectId(collectionId),
    userId,
  });

  if (!collection) {
    return { status: 404, success: false };
  }

  const result = await db.collection('collections').updateOne(
    { _id: new ObjectId(collectionId) },
    {
      $addToSet: { logos: logoId },
      $set: { updatedAt: new Date().toISOString() },
    }
  );

  return { status: 200, success: result.modifiedCount > 0 };
}

export async function removeLogoFromCollection(
  collectionId: string,
  logoId: string,
  userId: string
): Promise<SuccessResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, success: false };
  }

  const collection = await db.collection('collections').findOne({
    _id: new ObjectId(collectionId),
    userId,
  });

  if (!collection) {
    return { status: 404, success: false };
  }

  const result = await db.collection('collections').updateOne(
    { _id: new ObjectId(collectionId) },
    {
      $pull: { logos: { $eq: logoId } },
      $set: { updatedAt: new Date().toISOString() },
    }
  );

  return { status: 200, success: result.modifiedCount > 0 };
}

export async function shareCollection(
  collectionId: string,
  userId: string,
  input: ShareCollectionInput
): Promise<SuccessResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, success: false };
  }

  const collection = await db.collection('collections').findOne({
    _id: new ObjectId(collectionId),
    userId,
  });

  if (!collection) {
    return { status: 404, success: false };
  }

  const sharedUsers = input.sharedWith.map(userId => ({
    userId,
    permissions: input.permissions,
  }));

  const result = await db.collection('collections').updateOne(
    { _id: new ObjectId(collectionId) },
    {
      $set: {
        sharedWith: sharedUsers,
        updatedAt: new Date().toISOString(),
      },
    }
  );

  return { status: 200, success: result.modifiedCount > 0 };
}

export async function getSharedCollections(userId: string): Promise<CollectionsResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, collections: [], total: 0 };
  }

  const collections = await db
    .collection('collections')
    .find({
      'sharedWith.userId': userId,
    })
    .toArray();

  return {
    status: 200,
    collections: collections.map(col => ({
      ...col,
      _id: col._id.toString(),
    })) as CollectionDocument[],
    total: collections.length,
  };
}

export async function updateCollectionVisibility(
  collectionId: string,
  userId: string,
  isPublic: boolean
): Promise<CollectionResult> {
  const { db } = await connectToDatabase();
  
  if (!db) {
    return { status: 500, collection: null };
  }

  const existingCollection = await db.collection('collections').findOne({
    _id: new ObjectId(collectionId),
    userId,
  });

  if (!existingCollection) {
    return { status: 404, collection: null };
  }

  const updatedCollection = {
    ...existingCollection,
    isPublic,
    _id: existingCollection._id.toString(),
    updatedAt: new Date().toISOString(),
  };

  await db.collection('collections').updateOne(
    { _id: new ObjectId(collectionId) },
    { $set: { isPublic, updatedAt: updatedCollection.updatedAt } }
  );

  return { status: 200, collection: updatedCollection as CollectionDocument };
}
