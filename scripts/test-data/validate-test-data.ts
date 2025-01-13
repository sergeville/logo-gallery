import { MongoClient } from 'mongodb';
import { config } from 'dotenv';
import path from 'path';
import { validateUser, validateLogo, validateRelationships } from './utils/model-validators';
import { formatValidationResults } from './utils/validation-utils';
import { calculateDataQualityMetrics, printQualityReport } from './utils/quality-metrics';
import chalk from 'chalk';

// Load test environment variables
config({ path: path.join(__dirname, '../../.env.test') });

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/LogoGalleryTestDB';

async function validateTestData() {
  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log(chalk.blue('Connected to MongoDB'));

    const db = client.db();

    // Check collections
    const collections = await db.listCollections().toArray();
    const collectionNames = collections.map(c => c.name);
    
    console.log(chalk.blue('\nChecking collections...'));
    const requiredCollections = ['users', 'logos'];
    requiredCollections.forEach(collection => {
      if (collectionNames.includes(collection)) {
        console.log(chalk.green(`✓ Collection '${collection}' exists`));
      } else {
        console.log(chalk.red(`✗ Collection '${collection}' is missing`));
        process.exit(1);
      }
    });

    // Fetch all data
    const users = await db.collection('users').find({}).toArray();
    const logos = await db.collection('logos').find({}).toArray();

    console.log(chalk.blue('\nValidating data...'));
    console.log(chalk.gray(`Found ${users.length} users and ${logos.length} logos`));

    // Validate users
    console.log(chalk.blue('\nValidating users...'));
    const userValidations = users.map(user => {
      const result = validateUser(user);
      if (!result.isValid) {
        console.log(chalk.yellow(`\nIssues with user ${user._id}:`));
        console.log(formatValidationResults(result));
      }
      return result;
    });

    // Validate logos
    console.log(chalk.blue('\nValidating logos...'));
    const userIds = users.map(u => u._id.toString());
    const logoValidations = logos.map(logo => {
      const result = validateLogo(logo, userIds);
      if (!result.isValid) {
        console.log(chalk.yellow(`\nIssues with logo ${logo._id}:`));
        console.log(formatValidationResults(result));
      }
      return result;
    });

    // Validate relationships
    console.log(chalk.blue('\nValidating relationships...'));
    const relationshipValidation = validateRelationships(users, logos);
    console.log(formatValidationResults(relationshipValidation));

    // Check indexes
    console.log(chalk.blue('\nValidating indexes...'));
    
    const userIndexes = await db.collection('users').indexes();
    const requiredUserIndexes = ['email_1', 'username_1'];
    console.log(chalk.gray('\nUser indexes:'));
    requiredUserIndexes.forEach(indexName => {
      const exists = userIndexes.some(index => index.name === indexName);
      if (exists) {
        console.log(chalk.green(`✓ Index '${indexName}' exists`));
      } else {
        console.log(chalk.red(`✗ Missing required index '${indexName}'`));
      }
    });

    const logoIndexes = await db.collection('logos').indexes();
    const requiredLogoIndexes = ['name_1', 'category_1', 'tags_1', 'ownerId_1'];
    console.log(chalk.gray('\nLogo indexes:'));
    requiredLogoIndexes.forEach(indexName => {
      const exists = logoIndexes.some(index => index.name === indexName);
      if (exists) {
        console.log(chalk.green(`✓ Index '${indexName}' exists`));
      } else {
        console.log(chalk.red(`✗ Missing required index '${indexName}'`));
      }
    });

    // Calculate and print quality metrics
    const qualityReport = calculateDataQualityMetrics(users, logos);
    printQualityReport(qualityReport);

    // Summary
    const totalErrors = [
      ...userValidations,
      ...logoValidations,
      relationshipValidation
    ].reduce((sum, result) => sum + result.errors.length, 0);

    const totalWarnings = [
      ...userValidations,
      ...logoValidations,
      relationshipValidation
    ].reduce((sum, result) => sum + result.warnings.length, 0);

    console.log(chalk.blue('\nValidation Summary:'));
    console.log(chalk.gray(`Total Records: ${users.length + logos.length}`));
    console.log(chalk.red(`Total Errors: ${totalErrors}`));
    console.log(chalk.yellow(`Total Warnings: ${totalWarnings}`));

    // Exit with error if quality thresholds not met
    const qualityThresholdsMet = 
      qualityReport.metrics.completeness.score >= 0.95 &&
      qualityReport.metrics.consistency.score >= 0.98 &&
      qualityReport.metrics.validity.score >= 0.95;

    if (!qualityThresholdsMet || totalErrors > 0) {
      console.log(chalk.red('\nQuality thresholds not met. Please address the issues above.'));
      process.exit(1);
    }

  } catch (error) {
    console.error(chalk.red('Error validating test data:'), error);
    process.exit(1);
  } finally {
    await client.close();
    console.log(chalk.blue('\nDatabase connection closed'));
  }
}

// Run the script
if (require.main === module) {
  validateTestData().catch(console.error);
} 