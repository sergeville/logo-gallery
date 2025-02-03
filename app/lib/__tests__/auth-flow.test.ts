import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TestHelper } from './test-helper';
import { loginUser, registerUser } from '../auth';

describe('[P0] Authentication Flow', () => {
  const testHelper = TestHelper.getInstance();

  // Critical auth test cases
  const criticalAuthTests = {
    login: [
      {
        name: 'valid credentials',
        input: {
          email: 'test@example.com',
          password: 'ValidPass123!'
        },
        expected: {
          status: 200,
          hasAuthToken: true
        }
      },
      {
        name: 'invalid password',
        input: {
          email: 'test@example.com',
          password: 'WrongPass123!'
        },
        expected: {
          status: 401,
          error: 'Invalid credentials'
        }
      }
    ],
    registration: [
      {
        name: 'valid registration',
        input: {
          email: 'new@example.com',
          password: 'ValidPass123!',
          username: 'newuser'
        },
        expected: {
          status: 201,
          hasAuthToken: true
        }
      },
      {
        name: 'duplicate email',
        input: {
          email: 'test@example.com',
          password: 'ValidPass123!',
          username: 'testuser2'
        },
        expected: {
          status: 400,
          error: 'Email already registered'
        }
      }
    ]
  };

  beforeEach(async () => {
    // Setup test environment
    await testHelper.connect();
    await testHelper.clearCollections();
    
    // Create a test user for login tests
    await testHelper.createTestUser({
      email: 'test@example.com',
      password: 'ValidPass123!',
      username: 'testuser'
    });
  });

  afterEach(async () => {
    await testHelper.clearCollections();
    await testHelper.disconnect();
  });

  describe('[P0] User Login', () => {
    criticalAuthTests.login.forEach(({ name, input, expected }) => {
      it(`handles ${name}`, async () => {
        const result = await loginUser(input);

        expect(result.status).toBe(expected.status);
        
        if (expected.hasAuthToken) {
          expect(result.token).toBeDefined();
          expect(result.user).toBeDefined();
          expect(result.user.email).toBe(input.email);
        } else if (expected.error) {
          expect(result.error).toBe(expected.error);
        }
      });
    });

    it('[P0] maintains user session after login', async () => {
      const loginResult = await loginUser(criticalAuthTests.login[0].input);
      expect(loginResult.token).toBeDefined();

      // Verify session
      const session = await testHelper.getDb()
        .collection('sessions')
        .findOne({ userId: loginResult.user._id });

      expect(session).toBeDefined();
      expect(session?.isValid).toBe(true);
    });
  });

  describe('[P0] User Registration', () => {
    criticalAuthTests.registration.forEach(({ name, input, expected }) => {
      it(`handles ${name}`, async () => {
        const result = await registerUser(input);

        expect(result.status).toBe(expected.status);
        
        if (expected.hasAuthToken) {
          expect(result.token).toBeDefined();
          expect(result.user).toBeDefined();
          expect(result.user.email).toBe(input.email);
          expect(result.user.username).toBe(input.username);

          // Verify user was stored in database
          const storedUser = await testHelper.getDb()
            .collection('users')
            .findOne({ email: input.email });

          expect(storedUser).toBeDefined();
          expect(storedUser?.username).toBe(input.username);
        } else if (expected.error) {
          expect(result.error).toBe(expected.error);
        }
      });
    });

    it('[P0] creates valid session on registration', async () => {
      const regResult = await registerUser(criticalAuthTests.registration[0].input);
      expect(regResult.token).toBeDefined();

      // Verify session
      const session = await testHelper.getDb()
        .collection('sessions')
        .findOne({ userId: regResult.user._id });

      expect(session).toBeDefined();
      expect(session?.isValid).toBe(true);
    });
  });
}); 