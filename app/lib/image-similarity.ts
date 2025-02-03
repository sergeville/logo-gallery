import { createHash } from 'crypto';
import sharp from 'sharp';

export interface ImageFeatures {
  averageHash: string;
  perceptualHash: string;
  dominantColors: Array<{
    r: number;
    g: number;
    b: number;
    percentage: number;
  }>;
  aspectRatio: number;
}

interface SimilarityResult {
  similarity: number;
  matchType: string;
}

/**
 * Extracts features from an image buffer for similarity comparison
 */
export async function extractImageFeatures(buffer: Buffer): Promise<ImageFeatures> {
  const image = sharp(buffer);
  const metadata = await image.metadata();
  
  const [averageHash, perceptualHash] = await Promise.all([
    calculateAverageHash(image),
    calculatePerceptualHash(image)
  ]);

  const dominantColors = await extractDominantColors(image);
  const aspectRatio = metadata.width! / metadata.height!;

  return {
    averageHash,
    perceptualHash,
    dominantColors,
    aspectRatio
  };
}

/**
 * Compares two sets of image features and returns a similarity score
 */
export function compareImages(features1: ImageFeatures, features2: ImageFeatures): SimilarityResult {
  // Calculate individual similarity scores
  const hashSimilarity = calculateHashSimilarity(
    features1.averageHash,
    features2.averageHash,
    features1.perceptualHash,
    features2.perceptualHash
  );

  const colorSimilarity = calculateColorSimilarity(
    features1.dominantColors,
    features2.dominantColors
  );

  const aspectRatioSimilarity = calculateAspectRatioSimilarity(
    features1.aspectRatio,
    features2.aspectRatio
  );

  // Weight the different similarity measures
  const totalSimilarity = (
    hashSimilarity * 0.6 +
    colorSimilarity * 0.3 +
    aspectRatioSimilarity * 0.1
  );

  return {
    similarity: totalSimilarity,
    matchType: determineMatchType(totalSimilarity)
  };
}

// Private helper functions

async function calculateAverageHash(image: sharp.Sharp): Promise<string> {
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
}

async function calculatePerceptualHash(image: sharp.Sharp): Promise<string> {
  const resized = await image
    .resize(32, 32, { fit: 'fill' })
    .grayscale()
    .raw()
    .toBuffer();

  // Simplified DCT-based perceptual hash
  let hash = '';
  for (let y = 0; y < 8; y++) {
    for (let x = 0; x < 8; x++) {
      const idx = y * 32 + x;
      const val = resized[idx];
      hash += val > resized[idx + 1] ? '1' : '0';
    }
  }

  return hash;
}

async function extractDominantColors(image: sharp.Sharp): Promise<Array<{ r: number; g: number; b: number; percentage: number }>> {
  const pixels = await image
    .resize(50, 50, { fit: 'fill' })
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
}

function calculateHashSimilarity(
  avgHash1: string,
  avgHash2: string,
  percHash1: string,
  percHash2: string
): number {
  const avgHashDiff = hammingDistance(avgHash1, avgHash2) / avgHash1.length;
  const percHashDiff = hammingDistance(percHash1, percHash2) / percHash1.length;
  
  return 1 - (avgHashDiff * 0.4 + percHashDiff * 0.6);
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

function calculateAspectRatioSimilarity(ratio1: number, ratio2: number): number {
  const maxRatio = Math.max(ratio1, ratio2);
  const minRatio = Math.min(ratio1, ratio2);
  return minRatio / maxRatio;
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

function determineMatchType(similarity: number): string {
  if (similarity > 0.95) return 'exact';
  if (similarity > 0.85) return 'very similar';
  if (similarity > 0.75) return 'similar';
  if (similarity > 0.65) return 'somewhat similar';
  return 'different';
} 