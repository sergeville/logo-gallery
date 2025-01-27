import { setupServer } from 'msw/node';
import { rest } from 'msw';
import { mockUser } from '../helpers/test-utils';
import { generateTestLogo } from '../../utils/test-utils';

const mockLogo = generateTestLogo();

const handlers = [
  rest.post('/api/auth/callback/credentials', (_, res, ctx) => 
    res(ctx.json({ user: mockUser, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }))
  ),

  rest.get('/api/auth/session', (_, res, ctx) => 
    res(ctx.json({ user: mockUser, expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() }))
  ),

  rest.post('/api/logos', (_, res, ctx) => 
    res(ctx.json({ message: 'Logo uploaded successfully', logo: mockLogo }))
  ),

  rest.get('/api/logos', (_, res, ctx) => 
    res(ctx.json([{
      id: '1',
      name: 'Test Logo',
      description: 'A test logo description',
      imageUrl: '/test.png',
      userId: mockUser.id,
    }]))
  ),
];

export const server = setupServer(...handlers);

beforeAll(() => server.listen());
afterEach(() => server.resetHandlers());
afterAll(() => server.close()); 