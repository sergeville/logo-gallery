# Getting Started with Logo Gallery

This guide will walk you through setting up and contributing to the Logo Gallery project, with concrete examples at each step.

## Prerequisites

- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- Git
- npm or yarn

## Step 1: Initial Setup

1. Clone the repository:
```bash
git clone https://github.com/yourusername/logo-gallery.git
cd logo-gallery
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Example `.env.local` configuration:
```env
# Database Configuration
MONGODB_URI=mongodb://localhost:27017/LogoGalleryDevelopmentDB

# Authentication
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key

# Upload Configuration
UPLOAD_DIR=public/uploads
MAX_FILE_SIZE=5242880
```

## Step 2: Database Setup

1. Start MongoDB:
```bash
# macOS (with Homebrew)
brew services start mongodb-community

# Linux
sudo systemctl start mongod
```

2. Create development database:
```bash
mongosh
> use LogoGalleryDevelopmentDB
```

3. Seed test data:
```bash
npm run db:populate
```

## Step 3: Development Workflow

1. Start the development server:
```bash
npm run dev
```

2. Create a new feature branch:
```bash
git checkout -b feature/add-logo-search
```

3. Make your changes following our patterns:

Example component with proper TypeScript and error handling:
```typescript
// app/components/SearchBar.tsx
'use client';

interface SearchBarProps {
  onSearch: (query: string) => Promise<void>;
  placeholder?: string;
}

export default function SearchBar({ onSearch, placeholder = 'Search logos...' }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      await onSearch(query);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="relative">
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder={placeholder}
        className="w-full px-4 py-2 rounded-lg border"
        disabled={isLoading}
      />
      {error && (
        <p className="text-red-500 text-sm mt-1">{error}</p>
      )}
    </form>
  );
}
```

4. Add tests for your changes:
```typescript
// __tests__/components/SearchBar.test.tsx
import { render, fireEvent, waitFor } from '@testing-library/react';
import SearchBar from '@/app/components/SearchBar';

describe('SearchBar', () => {
  it('calls onSearch with input value', async () => {
    const onSearch = jest.fn();
    const { getByPlaceholderText } = render(
      <SearchBar onSearch={onSearch} />
    );

    const input = getByPlaceholderText('Search logos...');
    fireEvent.change(input, { target: { value: 'test query' } });
    fireEvent.submit(input);

    await waitFor(() => {
      expect(onSearch).toHaveBeenCalledWith('test query');
    });
  });

  it('displays error message on failure', async () => {
    const onSearch = jest.fn().mockRejectedValue(new Error('Search failed'));
    const { getByPlaceholderText, findByText } = render(
      <SearchBar onSearch={onSearch} />
    );

    fireEvent.submit(getByPlaceholderText('Search logos...'));
    
    expect(await findByText('Search failed')).toBeInTheDocument();
  });
});
```

## Step 4: Testing

1. Run the test suite:
```bash
npm test
```

2. Run visual regression tests:
```bash
npm run test:visual
```

3. Update visual snapshots if needed:
```bash
npm run test:visual:update
```

## Step 5: Submitting Changes

1. Commit your changes with a descriptive message:
```bash
git add .
git commit -m "feat(search): add logo search functionality

- Add SearchBar component with error handling
- Implement search API endpoint
- Add comprehensive tests"
```

2. Push your changes:
```bash
git push origin feature/add-logo-search
```

3. Create a pull request with:
- Clear description of changes
- Screenshots/videos if applicable
- Test coverage report
- List of affected components

## Common Patterns

### Error Handling
```typescript
try {
  const result = await someAsyncOperation();
  handleSuccess(result);
} catch (error) {
  if (error instanceof ValidationError) {
    handleValidationError(error);
  } else if (error instanceof NetworkError) {
    handleNetworkError(error);
  } else {
    captureException(error);
    showGenericError();
  }
}
```

### Data Fetching
```typescript
async function fetchLogos(query: string) {
  const response = await fetch(`/api/logos/search?q=${encodeURIComponent(query)}`, {
    headers: {
      'Content-Type': 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  return data as Logo[];
}
```

### Component Composition
```typescript
function LogoGallery({ logos }: { logos: Logo[] }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {logos.map(logo => (
        <ErrorBoundary key={logo._id} fallback={<LogoCardError />}>
          <LogoCard logo={logo} />
        </ErrorBoundary>
      ))}
    </div>
  );
}
```

## Troubleshooting

### Common Issues

1. MongoDB Connection Issues
```bash
# Check MongoDB status
brew services list  # macOS
systemctl status mongod  # Linux

# Verify connection string
echo $MONGODB_URI
```

2. Test Failures
```bash
# Update visual snapshots
npm run test:visual:update

# Clear Jest cache
npm test -- --clearCache
```

3. Build Errors
```bash
# Clear Next.js cache
rm -rf .next

# Rebuild
npm run build
```

## Getting Help

- Check the [FAQ](./FAQ.md)
- Join our [Discord community](https://discord.gg/logogallery)
- Open an issue on GitHub
- Ask in pull request comments 