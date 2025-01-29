'use client';

import { useState } from 'react';
import { imageOptimizationService } from '@/app/lib/services';

interface OptimizationPreview {
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  dimensions: {
    width: number;
    height: number;
  };
  format: string;
}

export default function FileUpload() {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [optimizationPreview, setOptimizationPreview] = useState<OptimizationPreview | null>(null);

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files?.[0]) return;
    const file = e.target.files[0];

    setUploading(true);
    setPreview(URL.createObjectURL(file));

    try {
      // Generate optimization preview
      const buffer = await file.arrayBuffer();
      const imageBuffer = Buffer.from(buffer);
      
      const analysis = await imageOptimizationService.analyzeImage(imageBuffer);
      const optimized = await imageOptimizationService.optimizeBuffer(imageBuffer, analysis);

      setOptimizationPreview({
        originalSize: file.size,
        optimizedSize: optimized.buffer.length,
        compressionRatio: ((file.size - optimized.buffer.length) / file.size * 100),
        dimensions: {
          width: optimized.metadata.width,
          height: optimized.metadata.height,
        },
        format: optimized.metadata.format,
      });

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Upload failed');

      const data = await response.json();
      console.log('File uploaded:', data.url);
    } catch (error) {
      console.error('Upload error:', error);
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-center w-full">
        <label className="flex flex-col items-center justify-center w-full h-64 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 dark:hover:bg-gray-800 dark:bg-gray-700 hover:bg-gray-100">
          <div className="flex flex-col items-center justify-center pt-5 pb-6">
            <svg className="w-8 h-8 mb-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 16">
              <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 13h3a3 3 0 0 0 0-6h-.025A5.56 5.56 0 0 0 16 6.5 5.5 5.5 0 0 0 5.207 5.021C5.137 5.017 5.071 5 5 5a4 4 0 0 0 0 8h2.167M10 15V6m0 0L8 8m2-2 2 2"/>
            </svg>
            <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
              <span className="font-semibold">Click to upload</span> or drag and drop
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400">SVG, PNG, JPG or WebP</p>
          </div>
          <input
            type="file"
            className="hidden"
            accept="image/*"
            onChange={handleUpload}
            disabled={uploading}
          />
        </label>
      </div>

      {uploading && (
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 dark:border-white"></div>
          <span className="ml-2">Uploading...</span>
        </div>
      )}

      {preview && optimizationPreview && (
        <div className="mt-4 p-4 bg-white dark:bg-gray-800 rounded-lg shadow">
          <div className="aspect-square relative mb-4">
            <img
              src={preview}
              alt="Upload preview"
              className="rounded-lg object-contain w-full h-full"
            />
          </div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="font-medium">Original:</span>{' '}
              {formatFileSize(optimizationPreview.originalSize)}
            </div>
            <div>
              <span className="font-medium">Optimized:</span>{' '}
              {formatFileSize(optimizationPreview.optimizedSize)}
            </div>
            <div>
              <span className="font-medium">Format:</span>{' '}
              {optimizationPreview.format.toUpperCase()}
            </div>
            <div>
              <span className="font-medium">Savings:</span>{' '}
              {optimizationPreview.compressionRatio.toFixed(1)}%
            </div>
            <div className="col-span-2">
              <span className="font-medium">Dimensions:</span>{' '}
              {optimizationPreview.dimensions.width} × {optimizationPreview.dimensions.height}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 