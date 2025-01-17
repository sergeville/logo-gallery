# Database Documentation

## Overview
The Logo Gallery application uses MongoDB as its primary database. This document outlines the database schema, relationships, and validation rules.

## Collections

### Users Collection
```typescript
{
  _id: ObjectId,
  name: string,          // Display name
  email: string,         // Unique email address
  image: string?,        // Profile image URL
  emailVerified: Date?,  // Email verification timestamp
  createdAt: Date,      // Account creation date
  updatedAt: Date       // Last update timestamp
}
```

### Logos Collection
```typescript
{
  _id: ObjectId,
  name: string,          // Logo name (3-100 chars)
  description: string,   // Logo description (max 1000 chars)
  imageUrl: string,      // Original image URL
  thumbnailUrl: string,  // Thumbnail image URL
  tags: string[],        // Array of tags (1-50 tags)
  ownerId: ObjectId,     // Reference to Users collection
  votes: number,         // Total number of votes
  rating: number,        // Average rating (0-5)
  dimensions: {
    width: number,
    height: number
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Votes Collection
```typescript
{
  _id: ObjectId,
  logoId: ObjectId,      // Reference to Logos collection
  userId: ObjectId,      // Reference to Users collection
  rating: number,        // Rating value (0-5)
  createdAt: Date,
  updatedAt: Date
}
```

## Indexes

### Users Collection
- `email`: Unique index
- `createdAt`: Index for sorting

### Logos Collection
- `ownerId`: Index for querying user's logos
- `tags`: Index for tag-based searches
- `createdAt`: Index for sorting
- `rating`: Index for sorting
- Compound index on `[tags, rating]` for filtered sorting

### Votes Collection
- Compound unique index on `[logoId, userId]` to prevent duplicate votes
- `createdAt`: Index for sorting

## Relationships
- One-to-Many: User -> Logos (one user can have many logos)
- Many-to-Many: Users <-> Logos through Votes (users can vote on multiple logos)

## Validation Rules

### Users
- Email must be unique and follow standard email format
- Name must be 3-50 characters long
- Profile image URL must be a valid URL

### Logos
- Name: 3-100 characters, alphanumeric with spaces/dash/underscore
- Description: Maximum 1000 characters
- Tags: 1-50 tags, each 2-30 characters
- Rating must be between 0 and 5
- Image URLs must be valid URLs
- Dimensions must be positive numbers

### Votes
- Rating must be between 0 and 5
- One vote per user per logo

## Performance Considerations
- Indexes are optimized for common queries like:
  - Fetching logos by tags
  - Sorting by rating or date
  - Looking up user's logos
  - Checking for existing votes
- Compound indexes support efficient filtering and sorting operations
- Regular archiving of old votes may be necessary for performance 