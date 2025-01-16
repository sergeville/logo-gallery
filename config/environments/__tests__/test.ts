import { getConfig } from '../index';
import { Config } from '../test';

describe('Test Environment Configuration', () => {
  it('should load test environment configuration correctly', () => {
    const config = getConfig() as Config;

    // MongoDB configuration
    expect(config.mongodb.uri).toBeDefined();
    expect(config.mongodb.dbName).toBe('LogoGalleryTestDB');
    expect(config.mongodb.options).toEqual({
      retryWrites: true,
      w: 'majority'
    });

    // Storage configuration
    expect(config.storage.uploadDir).toBeDefined();
    expect(config.storage.maxFileSize).toBe(1 * 1024 * 1024); // 1MB
    expect(config.storage.allowedFormats).toEqual(['image/png', 'image/jpeg', 'image/svg+xml']);

    // API configuration
    expect(config.api.baseUrl).toBe('http://localhost:3001');
    expect(config.api.timeout).toBe(5000);

    // Auth configuration
    expect(config.auth.nextAuthUrl).toBe('http://localhost:3001');
    expect(config.auth.nextAuthSecret).toBe('test-secret');
    expect(config.auth.jwtSecret).toBe('test-jwt-secret');

    // Logging configuration
    expect(config.logging.level).toBe('error');
    expect(config.logging.saveToFile).toBe(false);

    // Cleanup configuration
    expect(config.cleanup.afterEach).toBe(true);
    expect(config.cleanup.afterAll).toBe(true);

    // Default timeout
    expect(config.defaultTimeout).toBe(5000);
  });
}); 