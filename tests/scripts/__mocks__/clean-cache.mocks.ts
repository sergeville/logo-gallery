import { vi } from 'vitest';

// Create mock functions
export const mockFns = {
  fs: {
    existsSync: vi.fn(),
    rmSync: vi.fn()
  },
  childProcess: {
    execSync: vi.fn()
  },
  console: {
    log: vi.fn(),
    error: vi.fn()
  },
  process: {
    cwd: vi.fn().mockReturnValue('/fake/project/root')
  }
};

// Mock modules
vi.mock('fs', () => ({
  existsSync: mockFns.fs.existsSync,
  rmSync: mockFns.fs.rmSync
}));

vi.mock('child_process', () => ({
  execSync: mockFns.childProcess.execSync
}));

// Mock console methods
console.log = mockFns.console.log;
console.error = mockFns.console.error;

// Mock process.cwd
process.cwd = mockFns.process.cwd; 