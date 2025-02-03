/**
 * @vitest-environment node
 */

import { beforeEach, describe, it, expect, vi } from 'vitest';
import * as path from 'path';

// Create mock functions in hoisted scope
const mockFns = vi.hoisted(() => ({
  existsSync: vi.fn(),
  rmSync: vi.fn(),
  execSync: vi.fn(),
  log: vi.fn(),
  error: vi.fn(),
  cwd: vi.fn().mockReturnValue('/fake/project/root')
}));

// Mock modules
vi.mock('fs', () => ({
  existsSync: mockFns.existsSync,
  rmSync: mockFns.rmSync
}));

vi.mock('child_process', () => ({
  execSync: mockFns.execSync
}));

// Mock console methods
console.log = mockFns.log;
console.error = mockFns.error;

// Mock process.cwd
process.cwd = mockFns.cwd;

// Import script after mocks are set up
const { cleanCache } = require('../../scripts/clean-cache.js');

describe('Cache Cleaning Script', () => {
  const mockCacheDirs = [
    '.next/cache',
    'node_modules/.cache'
  ];

  beforeEach(() => {
    vi.clearAllMocks();
    mockFns.cwd.mockReturnValue('/fake/project/root');
  });

  it('should clean existing cache directories', () => {
    mockFns.existsSync.mockReturnValue(true);
    cleanCache();
    expect(mockFns.log).toHaveBeenCalledWith('🧹 Cleaning build caches...');
    mockCacheDirs.forEach(dir => {
      const fullPath = path.join('/fake/project/root', dir);
      expect(mockFns.rmSync).toHaveBeenCalledWith(fullPath, { recursive: true, force: true });
      expect(mockFns.log).toHaveBeenCalledWith(`✅ Cleaned ${dir}`);
    });
    expect(mockFns.execSync).toHaveBeenCalledWith('npm cache clean --force', { stdio: 'inherit' });
    expect(mockFns.log).toHaveBeenCalledWith('✅ Cleaned npm cache');
    expect(mockFns.log).toHaveBeenCalledWith('🎉 Cache cleaning completed!');
  });

  it('should skip non-existent directories', () => {
    mockFns.existsSync.mockReturnValue(false);
    cleanCache();
    expect(mockFns.log).toHaveBeenCalledWith('🧹 Cleaning build caches...');
    expect(mockFns.rmSync).not.toHaveBeenCalled();
    mockCacheDirs.forEach(dir => {
      expect(mockFns.log).toHaveBeenCalledWith(`ℹ️ ${dir} does not exist, skipping...`);
    });
    expect(mockFns.execSync).toHaveBeenCalledWith('npm cache clean --force', { stdio: 'inherit' });
    expect(mockFns.log).toHaveBeenCalledWith('✅ Cleaned npm cache');
    expect(mockFns.log).toHaveBeenCalledWith('🎉 Cache cleaning completed!');
  });

  it('should handle errors when cleaning directories', () => {
    mockFns.existsSync.mockReturnValue(true);
    mockFns.rmSync.mockImplementation(() => {
      throw new Error('Permission denied');
    });
    cleanCache();
    expect(mockFns.log).toHaveBeenCalledWith('🧹 Cleaning build caches...');
    mockCacheDirs.forEach(dir => {
      expect(mockFns.error).toHaveBeenCalledWith(
        `❌ Error cleaning ${dir}:`,
        'Permission denied'
      );
    });
    expect(mockFns.execSync).toHaveBeenCalledWith('npm cache clean --force', { stdio: 'inherit' });
    expect(mockFns.log).toHaveBeenCalledWith('✅ Cleaned npm cache');
    expect(mockFns.log).toHaveBeenCalledWith('🎉 Cache cleaning completed!');
  });

  it('should handle errors when cleaning npm cache', () => {
    mockFns.existsSync.mockReturnValue(false);
    mockFns.execSync.mockImplementation(() => {
      throw new Error('npm cache clean failed');
    });
    cleanCache();
    expect(mockFns.log).toHaveBeenCalledWith('🧹 Cleaning build caches...');
    mockCacheDirs.forEach(dir => {
      expect(mockFns.log).toHaveBeenCalledWith(`ℹ️ ${dir} does not exist, skipping...`);
    });
    expect(mockFns.error).toHaveBeenCalledWith(
      '❌ Error cleaning npm cache:',
      'npm cache clean failed'
    );
    expect(mockFns.log).toHaveBeenCalledWith('🎉 Cache cleaning completed!');
  });
});

