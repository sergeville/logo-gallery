import { MongoClient, ObjectId } from 'mongodb';
import { connectToDatabase, disconnectFromDatabase } from '../../app/lib/db';
import { validateUser, validateLogo } from './utils/model-validators';
import { ValidationResult } from '../../app/lib/validation';
import chalk from 'chalk';

interface ValidationReport {
  userId: string;
  logoId: string;
  errors: string[];
  warnings: string[];
  fixes: string[];
}

async function validateTestData() {
  const { db } = await connectToDatabase();
  const usersCollection = db.collection('users');
  const logosCollection = db.collection('logos');

  const reports: ValidationReport[] = [];

  // Validate users
  const users = await usersCollection.find({}).toArray();
  for (const user of users) {
    const result = validateUser(user);
    if (result.errors.length > 0 || result.warnings.length > 0) {
      const report = createReport(user._id.toString(), '', result);
      reports.push(report);
    }
  }

  // Validate logos
  const logos = await logosCollection.find({}).toArray();
  for (const logo of logos) {
    const result = validateLogo(logo);
    if (result.errors.length > 0 || result.warnings.length > 0) {
      const report = createReport(logo.userId?.toString() || '', logo._id.toString(), result);
      reports.push(report);
    }
  }

  await disconnectFromDatabase();
  return reports;
}

function createReport(userId: string, logoId: string, result: ValidationResult): ValidationReport {
  return {
    userId,
    logoId,
    errors: result.errors.map(e => e.message),
    warnings: result.warnings.map(w => w.message),
    fixes: result.fixes.map(f => f.action)
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
    const reports = await validateTestData();
    printReport(reports);
    process.exit(0);
  } catch (error) {
    console.error('Error during validation:', error);
    process.exit(1);
  }
}

main(); 