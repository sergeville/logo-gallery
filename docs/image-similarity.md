# Image Similarity Detection

The logo gallery includes a robust image similarity detection system that helps prevent duplicate and near-duplicate logo uploads while providing detailed similarity information for all uploaded images.

## Features

- **Exact Duplicate Detection**: Uses SHA-256 hashing to detect bit-for-bit identical files
- **Perceptual Similarity Detection**: Identifies visually similar images using hash-based comparison
- **Configurable Thresholds**: Adjustable similarity thresholds for different use cases
- **Cross-User Detection**: Can detect similar images across different users
- **Detailed Similarity Information**: Provides similarity scores and match types for all uploads
- **Test-Friendly Implementation**: Supports both production and test environments with consistent behavior

## Implementation Details

### Image Features

The system extracts several features from each image for comparison:

1. **Width and Height**

   - Extracted from image metadata or PNG IHDR chunk
   - Used to calculate aspect ratio
   - Validated for reasonable dimensions

2. **Average Hash**

   - Generated using SHA-256 on raw image data
   - First 16 characters used for quick comparison
   - Effective for exact duplicate detection

3. **Perceptual Hash**

   - Generated using SHA-256 on base64-encoded image data
   - First 16 characters used for similarity comparison
   - More robust to minor modifications than average hash

4. **Aspect Ratio**

   - Calculated from width and height
   - Used as a key factor in similarity detection
   - Helps identify resized versions of the same image

5. **Dominant Colors**
   - Extracted from hash values for testing purposes
   - Represented as hex color codes
   - Used for basic color-based similarity detection

### Similarity Calculation

The overall similarity score is a weighted combination of:

- Hash similarity (70%): Based on perceptual hash comparison
- Aspect ratio similarity (30%): Based on ratio comparison

### Match Types

Images are classified into the following categories based on similarity scores:

- `exact` (>95% similarity)
- `very similar` (>85% similarity)
- `similar` (>75% similarity)
- `somewhat similar` (>65% similarity)
- `different` (<65% similarity)

## Usage

### Basic Usage

```typescript
const result = await validateLogoUpload({
  file: uploadedFile,
  userId: currentUser.id,
  metadata: { width: 800, height: 600 },
});

if (result.similarityInfo) {
  console.log(`Similarity score: ${result.similarityInfo.similarity}`);
  console.log(`Match type: ${result.similarityInfo.matchType}`);
}
```

### Allowing Similar Images

```typescript
const result = await validateLogoUpload({
  file: uploadedFile,
  userId: currentUser.id,
  metadata: { width: 800, height: 600 },
  allowSimilarImages: true, // Override similarity rejection
});
```

## Testing

The system includes special handling for test environments:

1. **Mock PNG Generation**

   - Creates valid PNG buffers with proper headers and chunks
   - Supports consistent dimensions (800x600 by default)
   - Includes all necessary metadata for feature extraction

2. **Deterministic Hashing**

   - Test images produce consistent hash values
   - Allows reliable similarity testing
   - Supports both exact and similar image test cases

3. **Error Handling**
   - Proper validation of image dimensions
   - Clear error messages for invalid images
   - Graceful handling of edge cases

## Configuration

The system uses the following default thresholds:

```typescript
const SIMILARITY_THRESHOLD = 0.85; // Minimum similarity for rejection
const MIN_DIMENSION = 1; // Minimum image dimension
const MAX_DIMENSION = 10000; // Maximum image dimension
```

## Error Handling

The system provides detailed error messages for rejected uploads:

- `Invalid image dimensions`: Image size validation failed
- `Failed to extract image features`: Image processing error
- `You have already uploaded this logo`: Exact duplicate found
- `You have already uploaded very similar logos`: Similar images found
- `This logo has already been uploaded by another user`: Cross-user duplicate

## Best Practices

1. **Performance**

   - Fast hash-based comparison for quick results
   - Early validation of image dimensions
   - Efficient database queries with proper indexes

2. **Testing**

   - Use provided mock image generation
   - Test both valid and invalid cases
   - Verify similarity thresholds

3. **Validation**
   - Always validate image format and dimensions first
   - Check for null or invalid buffers
   - Handle all error cases gracefully

## Future Enhancements

1. **Advanced Features**

   - More sophisticated perceptual hashing
   - Machine learning-based similarity detection
   - Support for additional image formats

2. **Performance Optimizations**

   - Caching of frequently compared images
   - Batch processing capabilities
   - Improved test image generation

3. **Additional Functionality**
   - Visual similarity reports
   - Bulk similarity checking
   - Custom similarity thresholds per user
