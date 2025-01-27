# Logo Gallery API Documentation

## Logo Management

### Get Logo
`GET /api/logos/[id]`

Retrieves a specific logo by its ID.

**Response (200 OK)**
```json
{
  "id": "string",
  "name": "string",
  "description": "string",
  "imageUrl": "string",
  "thumbnailUrl": "string",
  "ownerId": "string",
  "ownerName": "string",
  "tags": ["string"],
  "category": "string",
  "dimensions": {
    "width": "number",
    "height": "number"
  },
  "fileSize": "number",
  "fileType": "string",
  "averageRating": "number",
  "totalVotes": "number",
  "createdAt": "string",
  "updatedAt": "string"
}
```

**Error Responses**
- `404 Not Found`: Logo not found
- `500 Internal Server Error`: Server error

### Delete Logo
`DELETE /api/logos/[id]`

Deletes a specific logo. Only the owner of the logo can delete it.

**Authentication Required**: Yes

**Response (200 OK)**
```json
{
  "message": "Logo deleted successfully"
}
```

**Error Responses**
- `401 Unauthorized`: User not authenticated
- `403 Forbidden`: User is not the owner of the logo
- `404 Not Found`: Logo not found
- `500 Internal Server Error`: Server error

### Upload Logo
`POST /api/logos/upload`

Uploads a new logo file and creates a logo entry.

**Authentication Required**: Yes

**Request Body (multipart/form-data)**
- `file`: Logo image file
- `name`: Logo name
- `description`: Logo description
- `category`: Logo category
- `tags`: Array of tags

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Logo uploaded successfully",
  "logo": {
    "id": "string",
    "name": "string",
    "description": "string",
    "imageUrl": "string",
    "thumbnailUrl": "string",
    "ownerId": "string",
    "ownerName": "string",
    "category": "string",
    "tags": ["string"],
    "dimensions": {
      "width": "number",
      "height": "number"
    },
    "fileSize": "number",
    "fileType": "string",
    "averageRating": "number",
    "totalVotes": "number",
    "createdAt": "string",
    "updatedAt": "string"
  }
}
```

**Error Responses**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid file type or missing required fields
- `500 Internal Server Error`: Server error

### Vote on Logo
`POST /api/logos/[id]/vote`

Adds or updates a user's vote on a logo.

**Authentication Required**: Yes

**Request Body**
```json
{
  "rating": "number" // 1-5
}
```

**Response (200 OK)**
```json
{
  "success": true,
  "message": "Vote recorded successfully",
  "averageRating": "number",
  "totalVotes": "number"
}
```

**Error Responses**
- `401 Unauthorized`: User not authenticated
- `400 Bad Request`: Invalid rating value
- `404 Not Found`: Logo not found
- `500 Internal Server Error`: Server error

## File Management

The application stores logo files in the `/public/uploads` directory. Files are:
- Named using UUID v4
- Automatically cleaned up when logos are deleted
- Validated for type (jpeg, png, gif, webp) and size
- Served directly from the `/uploads` path

## Error Handling

All API endpoints follow a consistent error response format:

```json
{
  "error": "Error message",
  "details": "Optional additional error details"
}
```

Common HTTP status codes:
- `200`: Success
- `400`: Bad Request (invalid input)
- `401`: Unauthorized (not authenticated)
- `403`: Forbidden (not authorized)
- `404`: Not Found
- `500`: Internal Server Error 