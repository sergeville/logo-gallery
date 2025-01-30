import { fixImportPaths } from '@/scripts/fix-imports';
import fs from 'fs/promises';
import path from 'path';
import os from 'os';

describe('Import Path Fixer', () => {
  let testDir: string;

  beforeEach(async () => {
    testDir = await fs.mkdtemp(path.join(os.tmpdir(), 'import-fixer-test-'));
  });

  afterEach(async () => {
    await fs.rm(testDir, { recursive: true, force: true });
  });

  async function createTestFile(filePath: string, content: string) {
    const fullPath = path.join(testDir, filePath);
    await fs.mkdir(path.dirname(fullPath), { recursive: true });
    await fs.writeFile(fullPath, content);
    return fullPath;
  }

  async function readTestFile(filePath: string) {
    const fullPath = path.join(testDir, filePath);
    return fs.readFile(fullPath, 'utf-8');
  }

  describe('Fixing Relative Imports', () => {
    it('should fix relative imports', async () => {
      const filePath = 'src/components/Button.tsx';
      await createTestFile(
        filePath,
        `import { useState } from 'react';
         import { utils } from '../utils';
         import { styles } from './styles';`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toContain(`import { utils } from '@/utils'`);
      expect(content).toContain(`import { styles } from '@/components/styles'`);
    });

    it('should preserve external imports', async () => {
      const filePath = 'src/components/Button.tsx';
      const originalContent = `import React from 'react';
                             import lodash from 'lodash';`;

      await createTestFile(filePath, originalContent);
      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toBe(originalContent);
    });
  });

  describe('Fixing Index Imports', () => {
    it('should fix index imports', async () => {
      const filePath = 'src/pages/Home.tsx';
      await createTestFile(
        filePath,
        `import { Button } from '@/components/Button/index';
         import { Card } from '@/components/Card/index.js';`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toContain(`import { Button } from '@/components/Button'`);
      expect(content).toContain(`import { Card } from '@/components/Card'`);
    });
  });

  describe('Fixing src/ Imports', () => {
    it('should fix src/ imports', async () => {
      const filePath = 'src/pages/Home.tsx';
      await createTestFile(
        filePath,
        `import { config } from 'src/config';
         import { utils } from 'src/utils/index';`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toContain(`import { config } from '@/config'`);
      expect(content).toContain(`import { utils } from '@/utils'`);
    });
  });

  describe('Dry Run Mode', () => {
    it('should not modify files in dry run mode', async () => {
      const filePath = 'src/components/Button.tsx';
      const originalContent = `import { utils } from '../utils';`;

      await createTestFile(filePath, originalContent);
      await fixImportPaths(testDir, true);
      const content = await readTestFile(filePath);

      expect(content).toBe(originalContent);
    });
  });

  describe('Edge Cases', () => {
    it('should handle files with multiple imports on one line', async () => {
      const filePath = 'src/test.tsx';
      await createTestFile(
        filePath,
        `import { a } from '../a'; import { b } from '../b';`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toContain(`import { a } from '@/a'`);
      expect(content).toContain(`import { b } from '@/b'`);
    });

    it('should handle imports with string literals', async () => {
      const filePath = 'src/test.tsx';
      await createTestFile(
        filePath,
        `import { a } from "../utils";
         import { b } from './components';`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toContain(`import { a } from '@/utils'`);
      expect(content).toContain(`import { b } from '@/src/components'`);
    });

    it('should handle comments in import statements', async () => {
      const filePath = 'src/test.tsx';
      await createTestFile(
        filePath,
        `// import from utils
         import { utils } from '../utils'; // end of line comment`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toContain(`import { utils } from '@/utils'`);
      expect(content).toContain(`// end of line comment`);
    });
  });

  describe('Error Handling', () => {
    it('should handle syntax errors gracefully', async () => {
      const filePath = 'src/invalid.ts';
      await createTestFile(
        filePath,
        `import { from 'broken-import';`
      );

      await expect(fixImportPaths(testDir)).resolves.not.toThrow();
    });

    it('should handle missing files gracefully', async () => {
      await expect(fixImportPaths(testDir)).resolves.not.toThrow();
    });

    it('should handle file system errors gracefully', async () => {
      const filePath = 'src/test.tsx';
      await createTestFile(filePath, `import { a } from '../a';`);
      
      // Make the directory read-only
      await fs.chmod(testDir, 0o444);

      await expect(fixImportPaths(testDir)).resolves.not.toThrow();

      // Restore permissions for cleanup
      await fs.chmod(testDir, 0o777);
    });
  });

  describe('Performance', () => {
    it('should handle large files efficiently', async () => {
      const filePath = 'src/large-file.tsx';
      let content = '';
      for (let i = 0; i < 1000; i++) {
        content += `import { util${i} } from '../utils';\n`;
      }

      await createTestFile(filePath, content);

      const startTime = process.hrtime();
      await fixImportPaths(testDir);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds + nanoseconds / 1e9;

      expect(totalTime).toBeLessThan(5); // Should complete in less than 5 seconds
    });
  });

  describe('Integration with Tools', () => {
    it('should preserve prettier formatting', async () => {
      const filePath = 'src/formatted.tsx';
      const formattedContent = 
        `import { useState } from 'react';\n\n` +
        `import { utils } from '../utils';\n` +
        `import { styles } from './styles';\n\n` +
        `export function Component() {\n` +
        `  return null;\n` +
        `}\n`;

      await createTestFile(filePath, formattedContent);
      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      // Check that blank lines and indentation are preserved
      expect(content).toMatch(/import.*from 'react';\n\nimport/);
      expect(content).toMatch(/from '@\/utils';\nimport/);
      expect(content).toMatch(/}\n$/);
    });

    it('should work with eslint-disable comments', async () => {
      const filePath = 'src/with-eslint.tsx';
      await createTestFile(
        filePath,
        `// eslint-disable-next-line import/no-relative-paths
         import { utils } from '../utils';
         /* eslint-disable import/no-relative-paths */
         import { styles } from './styles';
         /* eslint-enable import/no-relative-paths */`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      // Check that eslint comments are preserved
      expect(content).toContain('eslint-disable-next-line');
      expect(content).toContain('eslint-disable import/no-relative-paths');
      expect(content).toContain('eslint-enable import/no-relative-paths');
      // Check that imports are still fixed
      expect(content).toContain(`from '@/utils'`);
      expect(content).toContain(`from '@/src/styles'`);
    });

    it('should handle typescript path aliases', async () => {
      const filePath = 'src/with-aliases.tsx';
      await createTestFile(
        filePath,
        `import { Button } from '~/components/Button';
         import { utils } from '@app/utils';
         import { styles } from '$lib/styles';`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      // Check that all aliases are converted to @/
      expect(content).toContain(`from '@/components/Button'`);
      expect(content).toContain(`from '@/utils'`);
      expect(content).toContain(`from '@/styles'`);
    });
  });

  describe('Large Codebase Handling', () => {
    it('should handle deeply nested imports', async () => {
      // Create a deep directory structure
      const depth = 10;
      let importPath = '';
      let expectedPath = '';
      
      for (let i = 0; i < depth; i++) {
        importPath += '../';
        expectedPath += 'nested/';
        await createTestFile(
          `src/${expectedPath}file.ts`,
          'export const value = true;'
        );
      }

      const filePath = `src/${expectedPath}deep.tsx`;
      await createTestFile(
        filePath,
        `import { value } from '${importPath}file';`
      );

      await fixImportPaths(testDir);
      const content = await readTestFile(filePath);

      expect(content).toContain(`from '@/file'`);
    });

    it('should handle multiple files in parallel', async () => {
      const fileCount = 100;
      const filePromises = [];

      for (let i = 0; i < fileCount; i++) {
        filePromises.push(
          createTestFile(
            `src/components/Component${i}.tsx`,
            `import { utils } from '../../utils';
             import { styles } from './styles';`
          )
        );
      }

      await Promise.all(filePromises);
      
      const startTime = process.hrtime();
      await fixImportPaths(testDir);
      const [seconds, nanoseconds] = process.hrtime(startTime);
      const totalTime = seconds + nanoseconds / 1e9;

      // Should process files efficiently
      expect(totalTime).toBeLessThan(10);

      // Verify all files were fixed
      const content = await readTestFile('src/components/Component0.tsx');
      expect(content).toContain(`from '@/utils'`);
      expect(content).toContain(`from '@/components/styles'`);
    });

    it('should handle large monorepo structures', async () => {
      // Create a monorepo-like structure
      const packages = ['shared', 'web', 'mobile', 'desktop'];
      const filePromises = [];

      for (const pkg of packages) {
        filePromises.push(
          createTestFile(
            `packages/${pkg}/src/index.ts`,
            `import { utils } from '../../shared/src/utils';
             import { components } from '../components';`
          )
        );
      }

      await Promise.all(filePromises);
      await fixImportPaths(testDir);

      // Check that imports are correctly resolved
      const content = await readTestFile('packages/web/src/index.ts');
      expect(content).toContain(`from '@/shared/src/utils'`);
      expect(content).toContain(`from '@/web/components'`);
    });
  });
}); 