import { ValidationResult, ValidationError, FixSuggestion } from '@/app/lib/validation';
import chalk from 'chalk';

interface ValidationReport {
  errors: ValidationError[];
  warnings: ValidationError[];
  fixes: FixSuggestion[];
}

export function formatValidationReport(result: ValidationResult): string {
  let output = '';

  if (result.errors.length === 0 && result.warnings.length === 0) {
    output += chalk.green('✓ No validation issues found\n');
    return output;
  }

  if (result.errors.length > 0) {
    output += chalk.red('\nErrors:\n');
    result.errors.forEach(error => {
      output += chalk.red(`• ${error.field}: ${error.message}\n`);
    });
  }

  if (result.warnings.length > 0) {
    output += chalk.yellow('\nWarnings:\n');
    result.warnings.forEach(warning => {
      output += chalk.yellow(`• ${warning.field}: ${warning.message}\n`);
    });
  }

  if (result.fixes.length > 0) {
    output += chalk.green('\nSuggested Fixes:\n');
    result.fixes.forEach(fix => {
      output += chalk.green(`• ${fix.field}: ${fix.action}\n`);
    });
  }

  return output;
}

export function formatSummary(reports: ValidationReport[]): string {
  const totalErrors = reports.reduce((sum, r) => sum + r.errors.length, 0);
  const totalWarnings = reports.reduce((sum, r) => sum + r.warnings.length, 0);
  const totalFixes = reports.reduce((sum, r) => sum + r.fixes.length, 0);

  let output = chalk.blue('\nValidation Summary:\n');
  output += chalk.gray(`Total Reports: ${reports.length}\n`);
  output += chalk.red(`Total Errors: ${totalErrors}\n`);
  output += chalk.yellow(`Total Warnings: ${totalWarnings}\n`);
  output += chalk.green(`Available Fixes: ${totalFixes}\n`);

  return output;
} 