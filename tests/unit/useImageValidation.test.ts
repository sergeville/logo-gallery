import { renderHook, act } from '@testing-library/react';
import { useImageValidation } from '@/hooks/useImageValidation';

describe('useImageValidation', () => {
  const validImageFile = new File(['test image'], 'test.jpg', { type: 'image/jpeg' });
  const invalidTypeFile = new File(['test'], 'test.txt', { type: 'text/plain' });
  const largeSizeFile = new File(['large image'.repeat(1000000)], 'large.jpg', { type: 'image/jpeg' });

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('validates image file type successfully', async () => {
    const { result } = renderHook(() => useImageValidation());

    await act(async () => {
      const isValid = await result.current.validateImage(validImageFile);
      expect(isValid).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('rejects invalid file types', async () => {
    const { result } = renderHook(() => useImageValidation());

    await act(async () => {
      const isValid = await result.current.validateImage(invalidTypeFile);
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('Invalid file type. Please upload an image.');
  });

  it('enforces maximum file size', async () => {
    const { result } = renderHook(() => useImageValidation({ maxSizeInBytes: 1024 * 1024 }));

    await act(async () => {
      const isValid = await result.current.validateImage(largeSizeFile);
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('File size exceeds the maximum limit of 1MB.');
  });

  it('validates image dimensions', async () => {
    const { result } = renderHook(() => 
      useImageValidation({
        minWidth: 100,
        minHeight: 100,
        maxWidth: 1000,
        maxHeight: 1000
      })
    );

    // Mock Image loading
    const img = new Image();
    Object.defineProperty(img, 'width', { value: 500 });
    Object.defineProperty(img, 'height', { value: 500 });
    global.Image = jest.fn(() => img) as any;

    await act(async () => {
      const isValid = await result.current.validateImage(validImageFile);
      expect(isValid).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('rejects images with invalid dimensions', async () => {
    const { result } = renderHook(() => 
      useImageValidation({
        minWidth: 800,
        minHeight: 800
      })
    );

    // Mock Image loading with small dimensions
    const img = new Image();
    Object.defineProperty(img, 'width', { value: 400 });
    Object.defineProperty(img, 'height', { value: 400 });
    global.Image = jest.fn(() => img) as any;

    await act(async () => {
      const isValid = await result.current.validateImage(validImageFile);
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('Image dimensions must be at least 800x800 pixels.');
  });

  it('validates allowed file extensions', async () => {
    const { result } = renderHook(() => 
      useImageValidation({
        allowedExtensions: ['.jpg', '.jpeg', '.png']
      })
    );

    await act(async () => {
      const isValid = await result.current.validateImage(validImageFile);
      expect(isValid).toBe(true);
    });

    expect(result.current.error).toBeNull();
  });

  it('rejects disallowed file extensions', async () => {
    const { result } = renderHook(() => 
      useImageValidation({
        allowedExtensions: ['.png', '.gif']
      })
    );

    await act(async () => {
      const isValid = await result.current.validateImage(validImageFile);
      expect(isValid).toBe(false);
    });

    expect(result.current.error).toBe('Invalid file extension. Allowed extensions: .png, .gif');
  });
}); 