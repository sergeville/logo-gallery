import { parse } from '@typescript-eslint/typescript-estree';
import chalk from 'chalk';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';
import { checkImportPaths } from '@/scripts/import-checker';

export async function fixImportPaths(directory: string, dryRun: boolean = false): Promise<void> {
  const result = await checkImportPaths(directory);
  const fileEdits = new Map<string, { content: string; edits: { from: string; to: string; quote: "'" | '"' }[] }>();

  // Group edits by file
  for (const issue of result.issues) {
    if (!issue.suggestedFix) continue;

    const filePath = path.resolve(directory, issue.file);
    if (!fileEdits.has(filePath)) {
      try {
        const content = await fs.readFile(filePath, 'utf-8');
        fileEdits.set(filePath, { content, edits: [] });
      } catch (error) {
        console.error(chalk.red(`Error reading ${filePath}:`), error);
        continue;
      }
    }

    const fileEdit = fileEdits.get(filePath)!;
    const content = await fs.readFile(filePath, 'utf-8');
    const lines = content.split('\n');
    const line = lines[issue.line - 1];
    
    // Find all import paths in the line
    const importMatches = Array.from(line.matchAll(/from\s+(['"])([^'"]+)(['"])/g));
    for (const match of importMatches) {
      const [_, quote, from] = match;
      let to = from;

      // Handle src/ imports
      if (from.startsWith('src/')) {
        to = '@/' + from.slice(4).replace(/\/index(\.js|\.ts)?$/, '');
      }
      // Handle index imports
      else if (from.endsWith('/index') || from.endsWith('/index.js') || from.endsWith('/index.ts')) {
        to = from.replace(/\/index(\.js|\.ts)?$/, '');
      }
      // Handle relative imports
      else if (from.startsWith('.')) {
        const fullPath = path.resolve(path.dirname(filePath), from);
        const relativePath = path.relative(directory, fullPath);
        const fileInSrc = filePath.includes('/src/');
        const importInSrc = relativePath.startsWith('src/');
        const importPath = importInSrc ? relativePath.slice(4) : relativePath;
        
        // Convert relative paths to absolute paths with @/ prefix
        to = '@/' + importPath.replace(/\/index(\.js|\.ts)?$/, '');
      }
      // Handle existing aliases
      else if (from.startsWith('~') || from.startsWith('$lib')) {
        to = '@/' + from.slice(from.indexOf('/') + 1).replace(/\/index(\.js|\.ts)?$/, '');
      }

      // Only add the edit if the path needs to be fixed
      if (to !== from) {
        fileEdit.edits.push({ 
          from,
          to,
          quote: quote as "'" | '"'
        });
      }
    }
  }

  // Apply fixes
  for (const [filePath, { content, edits }] of fileEdits.entries()) {
    try {
      let newContent = content;

      // Sort edits by length (longest first) to avoid partial replacements
      edits.sort((a, b) => b.from.length - a.from.length);

      // Apply all edits to the file content
      for (const { from, to } of edits) {
        const escapedFrom = from.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
        // Always use single quotes in the output
        const importRegex = new RegExp(`(from\\s+)(['"])${escapedFrom}(['"])`, 'g');
        newContent = newContent.replace(importRegex, `$1'${to}'`);
      }

      if (dryRun) {
        console.log(chalk.yellow(`\nWould fix ${path.relative(directory, filePath)}:`));
        for (const { from, to } of edits) {
          console.log(`  ${from} -> ${to}`);
        }
      } else {
        await fs.writeFile(filePath, newContent);
        console.log(chalk.green(`Fixed ${path.relative(directory, filePath)}`));
      }
    } catch (error) {
      console.error(chalk.red(`Error fixing ${filePath}:`), error);
    }
  }

  // Print summary
  const totalFiles = fileEdits.size;
  const totalFixes = Array.from(fileEdits.values())
    .reduce((acc, { edits }) => acc + edits.length, 0);

  console.log(chalk.blue('\nSummary:'));
  console.log(`Total files with issues: ${totalFiles}`);
  console.log(`Total fixes ${dryRun ? 'needed' : 'applied'}: ${totalFixes}`);

  if (!dryRun && totalFixes > 0) {
    console.log(chalk.green('\n✓ All fixes applied successfully'));
  }
}

if (require.main === module) {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const directory = process.cwd();

  fixImportPaths(directory, dryRun).catch(error => {
    console.error(chalk.red('Error running import fixer:'), error);
    process.exit(1);
  });
} 