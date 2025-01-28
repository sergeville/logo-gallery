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
  name: string,        // Logo name
  description: string, // Logo description
  imageUrl: string,    // URL to the logo image
  thumbnailUrl: string,// URL to the thumbnail
  userId: ObjectId,    // Reference to Users collection
  tags: string[],      // Array of tags
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

## Relationships
- One-to-Many: User -> Logos (one user can have many logos)

## Validation Rules

### Users
- Email must be unique and follow standard email format
- Name must be 3-50 characters long
- Profile image URL must be a valid URL

### Logos
- Name: 3-100 characters, alphanumeric with spaces/dash/underscore
- Description: Maximum 1000 characters
- Tags: 1-50 tags, each 2-30 characters
- Image URLs must be valid URLs
- Dimensions must be positive numbers

## Performance Considerations
- Indexes are optimized for common queries like:
  - Fetching logos by tags
  - Looking up user's logos
  - Sorting by date
- Compound indexes support efficient filtering and sorting operations 