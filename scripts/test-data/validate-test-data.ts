import { MongoClient } from 'mongodb';
import { validateUser, validateLogo } from '../seed/validation';
import type { ValidationResult, ValidationError } from '@/lib/types';
import type { ClientUser, ClientLogo } from '@/lib/types';
import chalk from 'chalk';

interface ValidationReport {
  userId: string;
  logoId: string;
  errors: string[];
  warnings: string[];
  fixes: string[];
}

function createReport(userId: string, logoId: string, result: ValidationResult): string {
  const header = `Validation Report${userId ? ` for User ${userId}` : ''}${logoId ? ` for Logo ${logoId}` : ''}`
  const errors = result.errors.map((e: ValidationError) => `${e.field}: ${e.message}`).join('\n  ')
  const warnings = result.warnings.map((w: ValidationError) => `${w.field}: ${w.message}`).join('\n  ')
  
  return `${header}
${result.errors.length > 0 ? `\nErrors:\n  ${errors}` : ''}
${result.warnings.length > 0 ? `\nWarnings:\n  ${warnings}` : ''}`
}

async function validateTestData() {
  const client = new MongoClient(process.env.MONGODB_TEST_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('test');
    
    // Validate users
    const users = await db.collection('users').find().toArray();
    console.log(`\nValidating ${users.length} users...`);
    
    for (const user of users) {
      const result = await validateUser(user as Partial<ClientUser>);
      if (result.errors.length > 0 || result.warnings.length > 0) {
        console.log(`\nValidation issues for user ${user._id}:`);
        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach((error: ValidationError) => console.log(`- ${error.field}: ${error.message}`));
        }
        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach((warning: ValidationError) => console.log(`- ${warning.field}: ${warning.message}`));
        }
      }
    }
    
    // Validate logos
    const logos = await db.collection('logos').find().toArray();
    console.log(`\nValidating ${logos.length} logos...`);
    
    for (const logo of logos) {
      const result = await validateLogo(logo as Partial<ClientLogo>);
      if (result.errors.length > 0 || result.warnings.length > 0) {
        console.log(`\nValidation issues for logo ${logo._id}:`);
        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach((error: ValidationError) => console.log(`- ${error.field}: ${error.message}`));
        }
        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach((warning: ValidationError) => console.log(`- ${warning.field}: ${warning.message}`));
        }
      }
    }
    
    console.log('\nValidation complete');
  } catch (error) {
    console.error('Error validating test data:', error);
  } finally {
    await client.close();
  }
}

function printReport(reports: ValidationReport[]) {
  if (reports.length === 0) {
    console.log(chalk.green('No validation issues found.'));
    return;
  }

  console.log(chalk.yellow(`Found ${reports.length} validation issues:`));
  reports.forEach((report, index) => {
    console.log(chalk.white(`\nIssue #${index + 1}:`));
    if (report.userId) console.log(chalk.blue(`User ID: ${report.userId}`));
    if (report.logoId) console.log(chalk.blue(`Logo ID: ${report.logoId}`));
    
    if (report.errors.length > 0) {
      console.log(chalk.red('Errors:'));
      report.errors.forEach(error => console.log(chalk.red(`  • ${error}`)));
    }
    
    if (report.warnings.length > 0) {
      console.log(chalk.yellow('Warnings:'));
      report.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning}`)));
    }
    
    if (report.fixes.length > 0) {
      console.log(chalk.green('Applied fixes:'));
      report.fixes.forEach(fix => console.log(chalk.green(`  • ${fix}`)));
    }
  });
}

async function main() {
  try {
    await validateTestData();
    process.exit(0);
  } catch (error) {
    console.error('Error during validation:', error);
    process.exit(1);
  }
}

main(); 