# Image Similarity Detection

The logo gallery includes a robust image similarity detection system that helps prevent duplicate and near-duplicate logo uploads while providing detailed similarity information for all uploaded images.

## Features

- **Exact Duplicate Detection**: Uses SHA-256 hashing to detect bit-for-bit identical files
- **Perceptual Similarity Detection**: Identifies visually similar images using multiple algorithms
- **Configurable Thresholds**: Adjustable similarity thresholds for different use cases
- **Cross-User Detection**: Can detect similar images across different users
- **Detailed Similarity Information**: Provides similarity scores and match types for all uploads

## Implementation Details

### Image Features

The system extracts several features from each image for comparison:

1. **Average Hash (aHash)**
   - Resize image to 8x8
   - Convert to grayscale
   - Calculate average pixel value
   - Generate binary hash based on whether each pixel is above/below average

2. **Perceptual Hash (pHash)**
   - Resize image to 32x32
   - Convert to grayscale
   - Generate hash based on gradient differences
   - More robust to minor modifications than aHash

3. **Dominant Colors**
   - Extract up to 5 dominant colors
   - Store RGB values and percentages
   - Used for color-based similarity detection

4. **Aspect Ratio**
   - Used as a quick filter for obvious non-matches
   - Helps identify resized versions of the same image

### Similarity Calculation

The overall similarity score is a weighted combination of:

- Hash similarity (60%): Based on both aHash and pHash
- Color similarity (30%): Based on dominant color matching
- Aspect ratio similarity (10%): Based on ratio comparison

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
  metadata: { width: 100, height: 100 }
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
  metadata: { width: 100, height: 100 },
  allowSimilarImages: true // Override similarity rejection
});
```

## Configuration

The system uses the following default thresholds:

```typescript
const SIMILARITY_THRESHOLD = 0.85; // Minimum similarity for rejection
const MAX_SIMILAR_RESULTS = 5;     // Maximum similar logos to return
```

## Error Handling

The system provides detailed error messages for rejected uploads:

- `Duplicate file detected`: Exact duplicate found
- `Similar image detected (very similar)`: Near-duplicate found
- `Similar image detected (similar)`: Similar image found

## Best Practices

1. **Performance**
   - Image features are calculated once at upload time
   - Results are stored in the database for future comparisons
   - Use appropriate indexes on the `fileHash` field

2. **Storage**
   - Store extracted features alongside the image data
   - Consider storing reduced versions of features for quick comparison

3. **Validation**
   - Always validate image format and dimensions before similarity check
   - Consider implementing rate limiting for similarity checks

## Future Enhancements

1. **Advanced Features**
   - SIFT/SURF feature detection for more accurate matching
   - Neural network-based similarity detection
   - Support for more image formats (SVG, WebP)

2. **Performance Optimizations**
   - Implement locality-sensitive hashing for faster lookups
   - Add caching layer for frequently compared images
   - Parallel processing for feature extraction

3. **Additional Functionality**
   - Batch similarity checking
   - Similarity search API
   - Visual similarity reports 