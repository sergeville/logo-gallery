import { parse } from '@typescript-eslint/typescript-estree';
import chalk from 'chalk';
import { glob } from 'glob';
import fs from 'fs/promises';
import path from 'path';

interface ImportIssue {
  file: string;
  line: number;
  column: number;
  message: string;
  suggestedFix?: string;
}

interface ImportCheckResult {
  issues: ImportIssue[];
  stats: {
    filesChecked: number;
    issuesFound: number;
    fixableIssues: number;
  };
}

const IGNORED_PATTERNS = [
  '**/node_modules/**',
  '**/dist/**',
  '**/build/**',
  '**/.next/**',
  '**/coverage/**',
];

const VALID_IMPORT_PATTERNS = {
  components: '@/components/',
  hooks: '@/hooks/',
  lib: '@/lib/',
  types: '@/types/',
  utils: '@/utils/',
  styles: '@/styles/',
};

async function checkImportPaths(directory: string): Promise<ImportCheckResult> {
  const issues: ImportIssue[] = [];
  const files = await glob('**/*.{ts,tsx,js,jsx}', {
    cwd: directory,
    ignore: IGNORED_PATTERNS,
    absolute: true,
  });

  let filesChecked = 0;
  let fixableIssues = 0;

  for (const file of files) {
    const content = await fs.readFile(file, 'utf-8');
    try {
      const ast = parse(content, {
        jsx: true,
        loc: true,
      });

      ast.body.forEach(node => {
        if (node.type === 'ImportDeclaration') {
          const importPath = node.source.value as string;
          
          // Check relative imports
          if (importPath.startsWith('.')) {
            const issue: ImportIssue = {
              file: path.relative(directory, file),
              line: node.loc!.start.line,
              column: node.loc!.start.column,
              message: 'Relative import path used',
              suggestedFix: convertToAliasPath(importPath, file, directory),
            };
            issues.push(issue);
            if (issue.suggestedFix) fixableIssues++;
          }

          // Check index imports
          if (importPath.endsWith('/index')) {
            issues.push({
              file: path.relative(directory, file),
              line: node.loc!.start.line,
              column: node.loc!.start.column,
              message: 'Index import used',
              suggestedFix: importPath.replace('/index', ''),
            });
            fixableIssues++;
          }

          // Check src imports
          if (importPath.startsWith('src/')) {
            const issue: ImportIssue = {
              file: path.relative(directory, file),
              line: node.loc!.start.line,
              column: node.loc!.start.column,
              message: 'src/ import used',
              suggestedFix: importPath.replace('src/', '@/'),
            };
            issues.push(issue);
            fixableIssues++;
          }
        }
      });

      filesChecked++;
    } catch (error) {
      console.error(chalk.red(`Error parsing ${file}:`), error);
    }
  }

  return {
    issues,
    stats: {
      filesChecked,
      issuesFound: issues.length,
      fixableIssues,
    },
  };
}

function convertToAliasPath(importPath: string, currentFile: string, rootDir: string): string | undefined {
  const absolutePath = path.resolve(path.dirname(currentFile), importPath);
  const relativePath = path.relative(rootDir, absolutePath);

  // Check if the import maps to a known directory
  for (const [key, prefix] of Object.entries(VALID_IMPORT_PATTERNS)) {
    if (relativePath.startsWith(key + '/')) {
      return prefix + relativePath.slice(key.length + 1);
    }
  }

  // If no specific mapping found, use general @/ alias
  return '@/' + relativePath;
}

async function generateReport(result: ImportCheckResult): Promise<void> {
  console.log(chalk.bold('\nImport Path Check Report'));
  console.log('========================\n');

  console.log(chalk.blue('Statistics:'));
  console.log(`Files checked: ${result.stats.filesChecked}`);
  console.log(`Issues found: ${result.stats.issuesFound}`);
  console.log(`Fixable issues: ${result.stats.fixableIssues}\n`);

  if (result.issues.length === 0) {
    console.log(chalk.green('✓ No import path issues found'));
    return;
  }

  console.log(chalk.yellow('Issues Found:'));
  result.issues.forEach((issue, index) => {
    console.log(`\n${index + 1}. ${chalk.cyan(issue.file)}:${issue.line}:${issue.column}`);
    console.log(`   ${chalk.red('✗')} ${issue.message}`);
    if (issue.suggestedFix) {
      console.log(`   ${chalk.green('✓')} Suggested fix: ${issue.suggestedFix}`);
    }
  });
}

async function main() {
  try {
    const rootDir = process.cwd();
    console.log(chalk.blue('Checking import paths...'));
    const result = await checkImportPaths(rootDir);
    await generateReport(result);

    if (result.issues.length > 0) {
      process.exit(1);
    }
  } catch (error) {
    console.error(chalk.red('Error running import checker:'), error);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export { checkImportPaths, generateReport }; 