import { ObjectId, MongoClient } from 'mongodb';
import { connectToDatabase, disconnectFromDatabase } from '../../lib/db';
import { validateUser, validateLogo } from '../seed/validation';
import type { ValidationResult, ValidationError } from '../../app/lib/validation/validation-utils';
import type { ClientLogo, ClientUser } from '../seed/validation';
import chalk from 'chalk';

interface ValidationReport {
  userId: string;
  logoId: string;
  timestamp: string;
  result: ValidationResult;
}

async function validateAndFix() {
  const client = new MongoClient(process.env.MONGODB_URI || 'mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db(process.env.MONGODB_DB || 'logo-gallery');
    
    // Validate and fix users
    const users = await db.collection('users').find().toArray();
    console.log(`\nValidating ${users.length} users...`);
    
    for (const user of users) {
      const result = await validateUser(user as Partial<ClientUser>);
      if (!result.isValid) {
        console.log(`\nValidation issues for user ${user._id}:`);
        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach((error: ValidationError) => console.log(`- ${error.field}: ${error.message}`));
        }
        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach((warning: ValidationError) => console.log(`- ${warning.field}: ${warning.message}`));
        }
        if (result.data) {
          await db.collection('users').updateOne({ _id: user._id }, { $set: result.data });
          console.log('Fixed user data');
        }
      }
    }
    
    // Validate and fix logos
    const logos = await db.collection('logos').find().toArray();
    console.log(`\nValidating ${logos.length} logos...`);
    
    for (const logo of logos) {
      const result = await validateLogo({
        ...logo,
        createdAt: logo.createdAt ? new Date(logo.createdAt) : undefined
      } as Partial<ClientLogo>);
      if (!result.isValid) {
        console.log(`\nValidation issues for logo ${logo._id}:`);
        if (result.errors.length > 0) {
          console.log('Errors:');
          result.errors.forEach((error: ValidationError) => console.log(`- ${error.field}: ${error.message}`));
        }
        if (result.warnings.length > 0) {
          console.log('Warnings:');
          result.warnings.forEach((warning: ValidationError) => console.log(`- ${warning.field}: ${warning.message}`));
        }
        if (result.data) {
          await db.collection('logos').updateOne({ _id: logo._id }, { $set: result.data });
          console.log('Fixed logo data');
        }
      }
    }
    
    console.log('\nValidation and fix complete');
  } catch (error) {
    console.error('Error during validation and fix:', error);
  } finally {
    await client.close();
  }
}

function createReport(userId: string, logoId: string, result: ValidationResult): ValidationReport {
  return {
    userId,
    logoId,
    timestamp: new Date().toISOString(),
    result
  };
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
    
    if (report.result.errors.length > 0) {
      console.log(chalk.red('Errors:'));
      report.result.errors.forEach(error => console.log(chalk.red(`  • ${error.message}`)));
    }
    
    if (report.result.warnings.length > 0) {
      console.log(chalk.yellow('Warnings:'));
      report.result.warnings.forEach(warning => console.log(chalk.yellow(`  • ${warning.message}`)));
    }
    
    if (report.result.fixes.length > 0) {
      console.log(chalk.green('Applied fixes:'));
      report.result.fixes.forEach(fix => console.log(chalk.green(`  • ${fix.action}`)));
    }
  });
}

async function main() {
  try {
    await validateAndFix();
    process.exit(0);
  } catch (error) {
    console.error('Error during validation and fix:', error);
    process.exit(1);
  }
}

main(); 