import { createHash } from 'crypto';
import sharp from 'sharp';

export interface ImageFeatures {
  width: number;
  height: number;
  aspectRatio: number;
  averageHash: string;
  perceptualHash: string;
  dominantColors: string[];
}

export interface SimilarityResult {
  similarity: number;
  matchType: string;
}

export async function extractImageFeatures(buffer: Buffer): Promise<ImageFeatures> {
  try {
    // Create sharp instance once and ensure proper format handling
    const image = sharp(buffer, { failOnError: true });
    
    // Use sharp to get image metadata
    const metadata = await image.metadata();
    console.log('Image metadata:', metadata);
    
    if (!metadata.width || !metadata.height || metadata.width <= 0 || metadata.height <= 0) {
      console.error('Invalid image dimensions:', metadata);
      throw new Error('Invalid image dimensions');
    }

    // Convert to standardized format (sRGB color space)
    const standardizedImage = image.clone().toColorspace('srgb');

    const width = metadata.width;
    const height = metadata.height;
    const aspectRatio = width / height;

    // Generate average hash using the helper function
    const averageHash = await calculateAverageHash(standardizedImage.clone());

    // Generate perceptual hash using the helper function
    const perceptualHash = await calculatePerceptualHash(standardizedImage.clone());

    // Extract dominant colors
    const dominantColors = await extractDominantColors(standardizedImage.clone());

    return {
      width,
      height,
      aspectRatio,
      averageHash,
      perceptualHash,
      dominantColors: dominantColors.map(color => 
        `#${color.r.toString(16).padStart(2, '0')}${color.g.toString(16).padStart(2, '0')}${color.b.toString(16).padStart(2, '0')}`
      )
    };
  } catch (error) {
    console.error('Failed to extract image features:', error);
    throw new Error('Failed to extract image features: ' + error.message);
  }
}

export function compareImages(features1: ImageFeatures, features2: ImageFeatures): SimilarityResult {
  try {
    // Calculate different similarity metrics
    const hashSimilarity = calculateHashSimilarity(features1.perceptualHash, features2.perceptualHash);
    const aspectRatioSimilarity = calculateAspectRatioSimilarity(features1.aspectRatio, features2.aspectRatio);
    const colorSimilarity = calculateColorSimilarity(
      features1.dominantColors.map(hexToRgb),
      features2.dominantColors.map(hexToRgb)
    );

    // Combine similarities with weights
    // Give more weight to color differences since they're more visually significant
    const similarity = (hashSimilarity * 0.3) + (aspectRatioSimilarity * 0.2) + (colorSimilarity * 0.5);

    return {
      similarity,
      matchType: determineMatchType(similarity)
    };
  } catch (error) {
    console.error('Error comparing images:', error);
    return {
      similarity: 0,
      matchType: 'error'
    };
  }
}

// Helper function to convert hex color to RGB
function hexToRgb(hex: string): { r: number; g: number; b: number; percentage: number } {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16),
    percentage: 1 // Default to equal weight when converting from hex
  };
}

function calculateHashSimilarity(hash1: string, hash2: string): number {
  const minLength = Math.min(hash1.length, hash2.length);
  let matchingChars = 0;

  for (let i = 0; i < minLength; i++) {
    if (hash1[i] === hash2[i]) {
      matchingChars++;
    }
  }

  return matchingChars / minLength;
}

function calculateAspectRatioSimilarity(ratio1: number, ratio2: number): number {
  const maxRatio = Math.max(ratio1, ratio2);
  const minRatio = Math.min(ratio1, ratio2);
  return minRatio / maxRatio;
}

function determineMatchType(similarity: number): string {
  if (similarity > 0.98) return 'exact';
  if (similarity > 0.85) return 'very similar';
  if (similarity > 0.70) return 'similar';
  if (similarity > 0.55) return 'somewhat similar';
  return 'different';
}

// Private helper functions

async function calculateAverageHash(image: sharp.Sharp): Promise<string> {
  try {
    const resized = await image
      .resize(8, 8, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();

    const average = resized.reduce((sum, val) => sum + val, 0) / 64;
    let hash = '';

    for (let i = 0; i < 64; i++) {
      hash += resized[i] >= average ? '1' : '0';
    }

    return hash;
  } catch (error) {
    console.error('Error calculating average hash:', error);
    throw error;
  }
}

async function calculatePerceptualHash(image: sharp.Sharp): Promise<string> {
  try {
    const resized = await image
      .resize(32, 32, { fit: 'fill' })
      .grayscale()
      .raw()
      .toBuffer();

    // Improved DCT-based perceptual hash
    let hash = '';
    for (let y = 0; y < 8; y++) {
      for (let x = 0; x < 8; x++) {
        const idx = y * 32 + x;
        const nextIdx = idx + 1;
        // Ensure we don't go out of bounds
        if (nextIdx < resized.length) {
          hash += resized[idx] > resized[nextIdx] ? '1' : '0';
        }
      }
    }

    // Ensure consistent hash length
    while (hash.length < 64) {
      hash += '0';
    }

    return hash;
  } catch (error) {
    console.error('Error calculating perceptual hash:', error);
    throw error;
  }
}

async function extractDominantColors(image: sharp.Sharp): Promise<Array<{ r: number; g: number; b: number; percentage: number }>> {
  try {
    const pixels = await image
      .resize(50, 50, { fit: 'fill' })
      .removeAlpha() // Remove alpha channel before extracting colors
      .raw()
      .toBuffer();

    const colors: { [key: string]: number } = {};
    const totalPixels = 50 * 50;

    for (let i = 0; i < pixels.length; i += 3) {
      const r = pixels[i];
      const g = pixels[i + 1];
      const b = pixels[i + 2];
      const key = `${r},${g},${b}`;
      colors[key] = (colors[key] || 0) + 1;
    }

    return Object.entries(colors)
      .map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number);
        return { r, g, b, percentage: count / totalPixels };
      })
      .sort((a, b) => b.percentage - a.percentage)
      .slice(0, 5);
  } catch (error) {
    console.error('Error extracting dominant colors:', error);
    throw error;
  }
}

function calculateColorSimilarity(
  colors1: Array<{ r: number; g: number; b: number; percentage: number }>,
  colors2: Array<{ r: number; g: number; b: number; percentage: number }>
): number {
  let totalSimilarity = 0;
  let totalWeight = 0;

  for (const color1 of colors1) {
    const bestMatch = colors2
      .map(color2 => ({
        similarity: 1 - colorDistance(color1, color2) / 441.67, // max distance = sqrt(255^2 * 3)
        color: color2
      }))
      .sort((a, b) => b.similarity - a.similarity)[0];

    if (bestMatch) {
      const weight = Math.min(color1.percentage, bestMatch.color.percentage);
      totalSimilarity += bestMatch.similarity * weight;
      totalWeight += weight;
    }
  }

  return totalWeight > 0 ? totalSimilarity / totalWeight : 0;
}

function hammingDistance(str1: string, str2: string): number {
  let distance = 0;
  for (let i = 0; i < str1.length; i++) {
    if (str1[i] !== str2[i]) distance++;
  }
  return distance;
}

function colorDistance(
  color1: { r: number; g: number; b: number },
  color2: { r: number; g: number; b: number }
): number {
  const dr = color1.r - color2.r;
  const dg = color1.g - color2.g;
  const db = color1.b - color2.b;
  return Math.sqrt(dr * dr + dg * dg + db * db);
} 