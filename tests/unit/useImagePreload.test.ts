import { renderHook, act } from '@testing-library/react';
import { useImagePreload } from '@/hooks/useImagePreload';

describe('useImagePreload', () => {
  const mockImageUrls = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg'
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    // Mock Image constructor
    (global as any).Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      constructor() {
        setTimeout(() => this.onload(), 100); // Simulate successful load after 100ms
      }
    };
  });

  it('preloads images successfully', async () => {
    const { result } = renderHook(() => useImagePreload());

    await act(async () => {
      await result.current.preloadImages(mockImageUrls);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.loadedUrls).toEqual(mockImageUrls);
  });

  it('handles preload errors', async () => {
    // Mock Image to simulate error
    (global as any).Image = class {
      onload: () => void = () => {};
      onerror: () => void = () => {};
      src: string = '';
      constructor() {
        setTimeout(() => this.onerror(), 100); // Simulate error after 100ms
      }
    };

    const { result } = renderHook(() => useImagePreload());

    await act(async () => {
      try {
        await result.current.preloadImages(mockImageUrls);
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBe('Failed to preload some images');
    expect(result.current.loadedUrls).toEqual([]);
  });

  it('tracks loading progress', async () => {
    const { result } = renderHook(() => useImagePreload());

    let progressUpdates: number[] = [];
    result.current.onProgress = (progress) => {
      progressUpdates.push(progress);
    };

    await act(async () => {
      await result.current.preloadImages(mockImageUrls);
    });

    expect(progressUpdates.length).toBeGreaterThan(0);
    expect(progressUpdates[progressUpdates.length - 1]).toBe(100);
  });

  it('cancels preloading', async () => {
    const { result } = renderHook(() => useImagePreload());

    await act(async () => {
      const promise = result.current.preloadImages(mockImageUrls);
      result.current.cancel();
      await promise;
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.loadedUrls).toEqual([]);
  });

  it('handles empty url array', async () => {
    const { result } = renderHook(() => useImagePreload());

    await act(async () => {
      await result.current.preloadImages([]);
    });

    expect(result.current.isLoading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.loadedUrls).toEqual([]);
  });
}); 