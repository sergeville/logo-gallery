# Database Standards

## Configuration Standards

1. **Environment Variables**
```bash
# Required
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDB

# Optional (defaults will be used if not provided)
MONGODB_MAX_POOL_SIZE=50
MONGODB_CONNECT_TIMEOUT=30000
```

2. **Database Names**
```typescript
const DB_NAMES = {
  development: 'LogoGalleryDevelopmentDB',
  test: 'LogoGalleryTestDB',
  production: 'LogoGalleryDB'
} as const;
```

3. **Connection Options**
```typescript
const DB_OPTIONS = {
  development: {
    retryWrites: true,
    w: 'majority',
  },
  test: {
    retryWrites: true,
    w: 'majority',
  },
  production: {
    retryWrites: true,
    w: 'majority',
    ssl: true,
    authSource: 'admin',
    maxPoolSize: 50
  }
} as const;
```

## Connection Management

1. **Global Connection Caching**
```typescript
declare global {
  var mongoClientPromise: {
    client: MongoClient | null;
    promise: Promise<MongoClient> | null;
  };
}
```

2. **Connection Functions**
```typescript
// Connect
async function connectToDatabase() {
  // Use cached connection if available
  if (cached.client) {
    return { client: cached.client, db: cached.client.db() };
  }
  // Create new connection if needed
  // ...
}

// Disconnect
async function disconnectFromDatabase() {
  if (cached.client) {
    await cached.client.close();
    cached.client = null;
    cached.promise = null;
  }
}
```

## Error Handling

1. **Connection Errors**
```typescript
try {
  await connectToDatabase();
} catch (error) {
  console.error('Failed to connect to MongoDB:', error);
  // Handle connection failure appropriately
}
```

2. **Operation Errors**
```typescript
try {
  const result = await collection.findOne({ _id: id });
  if (!result) {
    throw new Error('Document not found');
  }
  return result;
} catch (error) {
  console.error('Database operation failed:', error);
  throw error; // Re-throw for route handler
}
```

## Query Standards

1. **ID Handling**
```typescript
import { ObjectId } from 'mongodb';

// Converting string ID to ObjectId
const id = new ObjectId(stringId);

// Querying by ID
const doc = await collection.findOne({ _id: id });
```

2. **Pagination**
```typescript
const ITEMS_PER_PAGE = 20;

const items = await collection
  .find(query)
  .skip(page * ITEMS_PER_PAGE)
  .limit(ITEMS_PER_PAGE)
  .toArray();
```

3. **Projections**
```typescript
// Only fetch needed fields
const user = await collection.findOne(
  { _id: userId },
  { projection: { password: 0, email: 1, name: 1 } }
);
```

## Schema Validation

1. **Collection Validation**
```typescript
await db.createCollection('logos', {
  validator: {
    $jsonSchema: {
      bsonType: 'object',
      required: ['title', 'imageUrl', 'userId'],
      properties: {
        title: {
          bsonType: 'string',
          minLength: 3,
          maxLength: 60
        },
        // ...
      }
    }
  }
});
```

2. **Index Creation**
```typescript
// Text indexes
await collection.createIndex({ title: 'text', description: 'text' });

// Compound indexes
await collection.createIndex({ userId: 1, createdAt: -1 });

// Unique indexes
await collection.createIndex({ email: 1 }, { unique: true });
```

## Testing Standards

1. **Test Database Setup**
```typescript
const testDbHelper = new TestDbHelper();

beforeAll(async () => {
  await testDbHelper.connect();
});

afterAll(async () => {
  await testDbHelper.disconnect();
});

afterEach(async () => {
  await testDbHelper.clearCollections();
});
```

2. **Mocking Database**
```typescript
jest.mock('@/app/lib/db-config', () => ({
  connectToDatabase: jest.fn().mockResolvedValue({
    db: {
      collection: jest.fn().mockReturnValue({
        findOne: jest.fn().mockResolvedValue(null),
        // ...
      })
    }
  })
}));
```

## Security Standards

1. **Input Validation**
```typescript
// Validate ObjectId
function isValidObjectId(id: string): boolean {
  return ObjectId.isValid(id);
}

// Sanitize query
function sanitizeQuery(query: any): any {
  // Remove any $ operators from user input
  return JSON.parse(
    JSON.stringify(query).replace(/\$/, '')
  );
}
```

2. **Authentication**
```typescript
// Require authentication for sensitive operations
async function requireAuth(req: NextApiRequest) {
  const session = await getServerSession(req);
  if (!session?.user) {
    throw new Error('Unauthorized');
  }
  return session.user;
}
```

## Performance Standards

1. **Connection Pooling**
- Use the global cached connection
- Configure appropriate pool size for environment
- Monitor connection pool metrics

2. **Query Optimization**
- Use appropriate indexes
- Limit returned fields with projections
- Implement pagination
- Use aggregation for complex queries

3. **Caching**
- Cache frequently accessed data
- Implement proper cache invalidation
- Use appropriate cache TTL

## Monitoring Standards

1. **Connection Monitoring**
```typescript
const client = await MongoClient.connect(uri, {
  monitorCommands: true
});

client.on('commandStarted', (event) => {
  console.log('Command started:', event);
});
```

2. **Performance Monitoring**
```typescript
const startTime = Date.now();
const result = await collection.findOne(query);
const duration = Date.now() - startTime;

if (duration > 100) {
  console.warn('Slow query detected:', {
    operation: 'findOne',
    duration,
    query
  });
}
``` 