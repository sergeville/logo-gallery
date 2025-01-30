export const useRouter = jest.fn(() => ({
  push: jest.fn(),
  replace: jest.fn(),
  back: jest.fn(),
  forward: jest.fn(),
  refresh: jest.fn(),
  prefetch: jest.fn(),
}));

export const usePathname = jest.fn(() => '/');
export const useSearchParams = jest.fn(() => new URLSearchParams());
export const useParams = jest.fn(() => ({}));

export const redirect = jest.fn();
export const notFound = jest.fn();

export const headers = jest.fn(() => new Headers());
export const cookies = jest.fn(() => new Map());

export const NextResponse = {
  json: jest.fn((data) => ({ ...data })),
  redirect: jest.fn((url) => ({ url })),
  next: jest.fn(),
  rewrite: jest.fn(),
}; 