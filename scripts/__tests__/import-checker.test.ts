import { checkImportPaths } from '@/scripts/import-checker';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Import Path Checker', () => {
  let testDir: string;

  beforeEach(async () => {
    // Create a temporary directory for test files
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'import-checker-test-'));
  });

  afterEach(async () => {
    // Clean up test directory
    await fs.rm(testDir, { recursive: true, force: true });
  });

  async function createTestFile(filePath: string, content: string) {
    const fullPath = path.join(testDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    return fullPath;
  }

  describe('Relative Import Detection', () => {
    it('should detect relative imports', async () => {
      await createTestFile(
        'src/components/Button.tsx',
        `import { useState } from 'react';
         import { utils } from '../utils';
         import { styles } from './styles';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].message).toBe('Relative import path used');
      expect(result.issues[0].suggestedFix).toContain('@/utils');
    });

    it('should ignore node_modules imports', async () => {
      await createTestFile(
        'src/components/Button.tsx',
        `import React from 'react';
         import lodash from 'lodash';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Index Import Detection', () => {
    it('should detect index imports', async () => {
      await createTestFile(
        'src/pages/Home.tsx',
        `import { Button } from '@/components/Button/index';
         import { Card } from '@/components/Card/index.js';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].message).toBe('Index import used');
      expect(result.issues[0].suggestedFix).toBe('@/components/Button');
    });
  });

  describe('src/ Import Detection', () => {
    it('should detect src/ imports', async () => {
      await createTestFile(
        'src/pages/Home.tsx',
        `import { config } from 'src/config';
         import { utils } from 'src/utils/index';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].message).toBe('src/ import used');
      expect(result.issues[0].suggestedFix).toBe('@/config');
    });
  });

  describe('Valid Imports', () => {
    it('should not flag valid imports', async () => {
      await createTestFile(
        'src/pages/Home.tsx',
        `import { Button } from '@/components/Button';
         import { useAuth } from '@/hooks/useAuth';
         import { api } from '@/lib/api';
         import type { User } from '@/types/user';
         import { formatDate } from '@/utils/date';
         import styles from '@/styles/Home.module.css';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.issues).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty files', async () => {
      await createTestFile('src/empty.ts', '');
      const result = await checkImportPaths(testDir);
      expect(result.issues).toHaveLength(0);
    });

    it('should handle files with syntax errors gracefully', async () => {
      await createTestFile(
        'src/invalid.ts',
        `import { from 'broken-import';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.stats.filesChecked).toBe(0);
    });

    it('should handle files with multiple issues', async () => {
      await createTestFile(
        'src/multiple-issues.ts',
        `import { a } from '../a';
         import { b } from './b/index';
         import { c } from 'src/c';
         import { d } from '../../d';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.issues.length).toBeGreaterThan(3);
      expect(result.stats.fixableIssues).toBe(result.issues.length);
    });
  });

  describe('Performance', () => {
    it('should handle large number of files', async () => {
      // Create 100 test files
      for (let i = 0; i < 100; i++) {
        await createTestFile(
          `src/components/Component${i}.tsx`,
          `import { useState } from 'react';
           import { utils } from '../utils';
           import { styles } from './styles';`
        );
      }

      const startTime = process.hrtime();
      const result = await checkImportPaths(testDir);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds + nanoseconds / 1e9;

      expect(result.stats.filesChecked).toBe(100);
      expect(totalTime).toBeLessThan(5); // Should complete in less than 5 seconds
    });
  });

  describe('Directory Structure', () => {
    it('should handle nested directories', async () => {
      await createTestFile(
        'src/features/auth/components/LoginForm/index.tsx',
        `import { Button } from '../../../components/Button';
         import { useAuth } from '../../hooks/useAuth';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.issues).toHaveLength(2);
      expect(result.issues[0].suggestedFix).toContain('@/components/Button');
      expect(result.issues[1].suggestedFix).toContain('@/hooks/useAuth');
    });
  });

  describe('Statistics', () => {
    it('should provide accurate statistics', async () => {
      await createTestFile(
        'src/test.tsx',
        `import { a } from '../a';
         import { b } from './b/index';
         import { c } from 'src/c';`
      );

      const result = await checkImportPaths(testDir);
      expect(result.stats.filesChecked).toBe(1);
      expect(result.stats.issuesFound).toBe(3);
      expect(result.stats.fixableIssues).toBe(3);
    });
  });
}); 