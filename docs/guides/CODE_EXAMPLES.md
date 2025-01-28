# Code Examples Guide

This guide provides concrete code examples for common patterns and implementations in the Logo Gallery project.

## Table of Contents
- [Components](#components)
- [Hooks](#hooks)
- [API Routes](#api-routes)
- [Database Operations](#database-operations)
- [Error Handling](#error-handling)
- [Testing](#testing)

## Components

### 1. Reusable Image Component
```typescript
// app/components/LogoImage.tsx
'use client';

interface LogoImageProps {
  src: string;
  alt: string;
  className?: string;
  priority?: boolean;
}

export default function LogoImage({ 
  src, 
  alt, 
  className = '', 
  priority = false 
}: LogoImageProps) {
  const [error, setError] = useState(false);

  if (error) {
    return (
      <div className="flex items-center justify-center bg-gray-100 dark:bg-gray-800 rounded-lg p-4">
        <span className="text-sm text-gray-500">Image not available</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      width={400}
      height={400}
      className={`object-cover rounded-lg ${className}`}
      onError={() => setError(true)}
      priority={priority}
    />
  );
}
```

### 2. Form with Validation
```typescript
// app/components/UploadForm.tsx
'use client';

interface UploadFormProps {
  onSubmit: (data: FormData) => Promise<void>;
}

export default function UploadForm({ onSubmit }: UploadFormProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrors({});

    try {
      const form = e.currentTarget;
      const formData = new FormData(form);
      await validateFormData(formData);
      await onSubmit(formData);
      form.reset();
    } catch (error) {
      if (error instanceof ValidationError) {
        setErrors(error.errors);
      } else {
        setErrors({ form: 'Submission failed. Please try again.' });
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label htmlFor="title" className="block text-sm font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          name="title"
          className="mt-1 block w-full rounded-md border-gray-300"
          required
        />
        {errors.title && (
          <p className="mt-1 text-sm text-red-600">{errors.title}</p>
        )}
      </div>

      <div>
        <label htmlFor="file" className="block text-sm font-medium">
          Logo File
        </label>
        <input
          type="file"
          id="file"
          name="file"
          accept="image/*"
          className="mt-1 block w-full"
          required
        />
        {errors.file && (
          <p className="mt-1 text-sm text-red-600">{errors.file}</p>
        )}
      </div>

      <button
        type="submit"
        disabled={isSubmitting}
        className="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
      >
        {isSubmitting ? 'Uploading...' : 'Upload Logo'}
      </button>
    </form>
  );
}
```

## Hooks

### 1. Data Fetching Hook
```typescript
// app/hooks/useLogos.ts
import useSWR from 'swr';

interface UseLogosOptions {
  page?: number;
  limit?: number;
  search?: string;
}

export function useLogos({ page = 1, limit = 20, search = '' }: UseLogosOptions = {}) {
  const { data, error, isLoading, mutate } = useSWR(
    `/api/logos?page=${page}&limit=${limit}&search=${search}`,
    async (url) => {
      const res = await fetch(url);
      if (!res.ok) {
        throw new Error('Failed to fetch logos');
      }
      return res.json();
    }
  );

  return {
    logos: data?.logos ?? [],
    pagination: data?.pagination,
    isLoading,
    isError: error,
    mutate,
  };
}
```

### 2. Form State Hook
```typescript
// app/hooks/useForm.ts
interface UseFormOptions<T> {
  initialValues: T;
  validate?: (values: T) => Record<string, string>;
  onSubmit: (values: T) => Promise<void>;
}

export function useForm<T extends Record<string, any>>({
  initialValues,
  validate,
  onSubmit,
}: UseFormOptions<T>) {
  const [values, setValues] = useState<T>(initialValues);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setValues(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (validate) {
      const validationErrors = validate(values);
      if (Object.keys(validationErrors).length > 0) {
        setErrors(validationErrors);
        setIsSubmitting(false);
        return;
      }
    }

    try {
      await onSubmit(values);
      setErrors({});
    } catch (error) {
      setErrors({ submit: error instanceof Error ? error.message : 'Submission failed' });
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    values,
    errors,
    isSubmitting,
    handleChange,
    handleSubmit,
  };
}
```

## API Routes

### 1. Protected API Route
```typescript
// app/api/logos/route.ts
import { getServerSession } from 'next-auth/next';
import { authOptions } from '../auth/[...nextauth]/route';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return new Response('Unauthorized', { status: 401 });
    }

    const data = await request.formData();
    const file = data.get('file') as File;
    
    if (!file) {
      return new Response('No file provided', { status: 400 });
    }

    // Process file and save to database
    const logo = await processAndSaveLogo(file, session.user.id);

    return new Response(JSON.stringify(logo), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Upload error:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

## Database Operations

### 1. MongoDB Model with Validation
```typescript
// app/models/Logo.ts
import mongoose from 'mongoose';

const logoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    minlength: [3, 'Title must be at least 3 characters'],
    maxlength: [100, 'Title cannot exceed 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot exceed 500 characters'],
  },
  imageUrl: {
    type: String,
    required: [true, 'Image URL is required'],
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required'],
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag cannot exceed 30 characters'],
  }],
  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Add indexes
logoSchema.index({ title: 'text', description: 'text' });
logoSchema.index({ userId: 1, createdAt: -1 });

// Add methods
logoSchema.methods.isOwnedBy = function(userId: string) {
  return this.userId.toString() === userId;
};

export const Logo = mongoose.models.Logo || mongoose.model('Logo', logoSchema);
```

## Error Handling

### 1. Custom Error Classes
```typescript
// app/lib/errors.ts
export class ValidationError extends Error {
  constructor(
    public errors: Record<string, string>
  ) {
    super('Validation failed');
    this.name = 'ValidationError';
  }
}

export class AuthorizationError extends Error {
  constructor(message = 'Unauthorized') {
    super(message);
    this.name = 'AuthorizationError';
  }
}

export class ResourceNotFoundError extends Error {
  constructor(resource: string) {
    super(`${resource} not found`);
    this.name = 'ResourceNotFoundError';
  }
}
```

### 2. Error Boundary Component
```typescript
// app/components/ErrorBoundary.tsx
'use client';

interface Props {
  children: React.ReactNode;
  fallback: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return {
      hasError: true,
      error,
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback;
    }

    return this.props.children;
  }
}
```

## Testing

### 1. Component Test
```typescript
// __tests__/components/LogoCard.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { LogoCard } from '@/app/components/LogoCard';

describe('LogoCard', () => {
  const mockLogo = {
    _id: '123',
    title: 'Test Logo',
    imageUrl: '/test.png',
    description: 'Test Description',
    userId: 'user123',
  };

  it('renders logo information correctly', () => {
    render(<LogoCard logo={mockLogo} />);
    
    expect(screen.getByText('Test Logo')).toBeInTheDocument();
    expect(screen.getByText('Test Description')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', '/test.png');
  });

  it('handles image load error gracefully', () => {
    render(<LogoCard logo={{ ...mockLogo, imageUrl: 'invalid.jpg' }} />);
    
    const img = screen.getByRole('img');
    fireEvent.error(img);
    
    expect(screen.getByText('Image not available')).toBeInTheDocument();
  });
});
```

### 2. API Route Test
```typescript
// __tests__/api/logos.test.ts
import { createMocks } from 'node-mocks-http';
import { POST } from '@/app/api/logos/route';

jest.mock('next-auth/next', () => ({
  getServerSession: jest.fn(() => Promise.resolve({
    user: { id: 'test-user-id' }
  }))
}));

describe('/api/logos', () => {
  it('creates a new logo with valid data', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Logo');
    formData.append('file', new Blob(['test'], { type: 'image/png' }), 'test.png');

    const { req, res } = createMocks({
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    const data = await response.json();

    expect(response.status).toBe(201);
    expect(data).toHaveProperty('_id');
    expect(data.title).toBe('Test Logo');
  });

  it('returns 400 for missing file', async () => {
    const formData = new FormData();
    formData.append('title', 'Test Logo');

    const { req, res } = createMocks({
      method: 'POST',
      body: formData,
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
```

These examples demonstrate:
- Type safety with TypeScript
- Proper error handling
- Testing best practices
- Component composition
- Form handling
- API route implementation
- Database operations
- Custom hooks usage 