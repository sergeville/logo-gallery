# Logo Gallery Database Documentation

## Overview

The Logo Gallery application uses MongoDB as its primary database. This document outlines the database structure, collections, relationships, and validation rules.

## Collections

### Logos Collection

```typescript
{
  title: {
    type: String,
    required: true,
    maxlength: 60,
    minlength: 3,
    trim: true
  },
  description: {
    type: String,
    required: true,
    maxlength: 200,
    minlength: 10,
    trim: true
  },
  imageUrl: {
    type: String,
    required: true,
    // Must be a valid path to image file
    validate: /^\/uploads\/.*\.(png|jpg|jpeg|gif|webp|svg)$/i
  },
  thumbnailUrl: {
    type: String,
    required: true,
    // Must be a valid path to image file
    validate: /^\/uploads\/.*\.(png|jpg|jpeg|gif|webp|svg)$/i
  },
  userId: {
    type: String,
    required: true,
    index: true
  },
  ownerName: {
    type: String,
    trim: true
  },
  dimensions: {
    width: Number,
    height: Number
  },
  fileSize: {
    type: Number,
    required: true
  },
  fileType: {
    type: String,
    required: true
  },
  votes: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      required: true
    },
    timestamp: {
      type: Date,
      default: Date.now
    }
  }],
  createdAt: {
    type: Date,
    default: Date.now,
    immutable: true
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}
```

### Users Collection

```typescript
{
  name: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  image: String,
  emailVerified: Date,
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Logos Collection
```typescript
// Text search on title and description
logoSchema.index({ title: 'text', description: 'text' });

// Quick access to user's logos and title combinations
logoSchema.index({ userId: 1, title: 1 });

// Sorting by creation date
logoSchema.index({ createdAt: -1 });

// Efficient vote queries
logoSchema.index({ 'votes.userId': 1 });
```

### Users Collection
```typescript
// Unique email addresses
userSchema.index({ email: 1 }, { unique: true });
```

## Relationships

- Each logo document references a user through the `userId` field
- Votes are embedded within each logo document as an array
- Each vote contains:
  - The voter's user ID (`userId`)
  - Timestamp of the vote (`timestamp`)

## Validation Rules

### Logo Validation
- Title: 3-60 characters
- Description: 10-200 characters
- Image URLs: Must be valid paths to image files
- File types: Limited to png, jpg, jpeg, gif, webp, svg
- Required fields:
  - title
  - description
  - imageUrl
  - thumbnailUrl
  - userId
  - fileSize
  - fileType

### Vote Validation
- Cannot vote for your own logo
- Can only vote once per logo
- Must be authenticated to vote
- Vote operations are atomic to prevent race conditions

## Data Operations

### Voting Process
1. Authenticate user
2. Validate logo ID
3. Check ownership (prevent self-voting)
4. Check for existing votes
5. Add vote to array with timestamp
6. Save changes atomically

### Logo Creation
1. Validate file type and size
2. Generate unique filenames
3. Create thumbnails
4. Save files to uploads directory
5. Create database entry with all required fields

## Performance Considerations

- Indexes are used to optimize:
  - User-specific queries
  - Text searches
  - Date-based sorting
  - Vote operations
- Embedded votes prevent additional collection queries
- Thumbnails reduce load times for gallery views
- File validations prevent invalid uploads
- Atomic operations prevent race conditions

## Security

- File paths are validated to prevent directory traversal
- User authentication required for sensitive operations
- Vote operations check for proper authorization
- File size limits prevent abuse
- File type restrictions reduce security risks

## Error Handling

### Common Errors

1. **Next.js Route Parameter Error**
```
Error: Route "/api/logos/[id]/vote" used `params.id`. `params` should be awaited before using its properties.
```
- **Cause**: Trying to access dynamic route parameters synchronously
- **Solution**: Use proper parameter extraction in route handlers:
```typescript
// Incorrect
const { id } = context.params

// Correct
const logoId = context.params.id
if (!logoId) {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
}
```

2. **MongoDB Validation Errors**
```
Error: Logo validation failed: userId: Please provide a user ID, title: Please provide a title for your logo
```
- **Cause**: Missing required fields when creating/updating documents
- **Solution**: Ensure all required fields are provided:
  - userId
  - title
  - description
  - imageUrl
  - thumbnailUrl

3. **ObjectId Type Errors**
```
ObjectParameterError: Parameter "obj" to Document() must be an object, got "string"
```
- **Cause**: Passing string ID directly instead of MongoDB ObjectId
- **Solution**: Convert string IDs to ObjectId:
```typescript
const objectId = new Types.ObjectId(stringId)
```

4. **Vote Validation Errors**
```
Error: Logo validation failed: votes.0.userId: Path `userId` is required
```
- **Cause**: Invalid vote structure or missing userId in votes array
- **Solution**: Ensure vote object has required fields:
```typescript
const vote = {
  userId: new Types.ObjectId(session.user.id),
  timestamp: new Date()
}
```

### Error Prevention

1. **Data Validation**
   - Always validate input data before database operations
   - Use Mongoose schema validation rules
   - Check for required fields
   - Validate ObjectId format

2. **Type Safety**
   - Convert string IDs to ObjectId when querying
   - Use proper type checking for user session data
   - Validate vote object structure before saving

3. **Authentication Checks**
   - Verify user session exists
   - Check user permissions
   - Validate user ownership where required

4. **Database Operations**
   - Use try-catch blocks for all database operations
   - Implement proper error handling and logging
   - Return appropriate error responses to client

### Debugging Tips

1. **Model Initialization**
```
Initializing Logo model...
Creating new Logo model
Logo model created successfully
```
- Check model initialization logs
- Verify model is created only once
- Monitor for duplicate model creation

2. **Request Flow**
```
GET /api/logos 200 in 247ms
POST /api/logos/[id]/vote 500 in 373ms
```
- Monitor request timing
- Check response status codes
- Log operation durations

3. **Database Connection**
```
Connected to MongoDB successfully
```
- Verify database connection status
- Monitor connection errors
- Check connection pool status 