import { MongoClient, Db } from 'mongodb';
import chalk from 'chalk';
import { validateUser, validateLogo, validateRelationships } from '../test-data/utils/model-validators';
import { performanceMonitor, wrapDatabaseWithMonitoring } from '../test-data/utils/performance-monitor';
import { generateQualityReport, formatQualityReport, generateRecommendations } from '../test-data/utils/quality-report';

interface MigrationStats {
  processed: number;
  fixed: number;
  failed: number;
  skipped: number;
}

async function validateAndFix(client: MongoClient, db: Db): Promise<void> {
  console.log(chalk.blue('\n🔍 Starting validation and fix process...\n'));

  const stats: { [key: string]: MigrationStats } = {
    users: { processed: 0, fixed: 0, failed: 0, skipped: 0 },
    logos: { processed: 0, fixed: 0, failed: 0, skipped: 0 }
  };

  // Wrap database with performance monitoring
  const monitoredDb = wrapDatabaseWithMonitoring(db);

  try {
    // Step 1: Load all data
    const users = await monitoredDb.collection('users').find({}).toArray();
    const logos = await monitoredDb.collection('logos').find({}).toArray();

    console.log(chalk.gray(`Found ${users.length} users and ${logos.length} logos`));

    // Step 2: Validate and fix users
    console.log(chalk.blue('\nValidating users...'));
    for (const user of users) {
      stats.users.processed++;
      const validationResult = validateUser(user);

      if (!validationResult.isValid) {
        const fixableIssues = validationResult.errors.filter(e => 
          e.fixes?.some(f => f.autoFixable)
        );

        if (fixableIssues.length > 0) {
          try {
            const updates: any = {};

            // Apply automatic fixes
            for (const issue of fixableIssues) {
              for (const fix of issue.fixes || []) {
                if (fix.autoFixable) {
                  switch (issue.message) {
                    case 'Invalid createdAt date':
                    case 'Invalid updatedAt date':
                      updates[issue.message.includes('created') ? 'createdAt' : 'updatedAt'] = new Date();
                      break;
                    // Add more automatic fixes here
                  }
                }
              }
            }

            if (Object.keys(updates).length > 0) {
              await monitoredDb.collection('users').updateOne(
                { _id: user._id },
                { $set: updates }
              );
              stats.users.fixed++;
              console.log(chalk.green(`✓ Fixed user ${user._id}`));
            } else {
              stats.users.skipped++;
            }
          } catch (error) {
            stats.users.failed++;
            console.error(chalk.red(`✗ Failed to fix user ${user._id}: ${error}`));
          }
        } else {
          stats.users.skipped++;
          console.log(chalk.yellow(`⚠️ User ${user._id} has non-auto-fixable issues`));
        }
      }
    }

    // Step 3: Validate and fix logos
    console.log(chalk.blue('\nValidating logos...'));
    const userIds = users.map(u => u._id.toString());

    for (const logo of logos) {
      stats.logos.processed++;
      const validationResult = validateLogo(logo, userIds);

      if (!validationResult.isValid) {
        const fixableIssues = validationResult.errors.filter(e => 
          e.fixes?.some(f => f.autoFixable)
        );

        if (fixableIssues.length > 0) {
          try {
            const updates: any = {};

            // Apply automatic fixes
            for (const issue of fixableIssues) {
              for (const fix of issue.fixes || []) {
                if (fix.autoFixable) {
                  switch (issue.message) {
                    case 'Invalid createdAt date':
                    case 'Invalid updatedAt date':
                      updates[issue.message.includes('created') ? 'createdAt' : 'updatedAt'] = new Date();
                      break;
                    // Add more automatic fixes here
                  }
                }
              }
            }

            if (Object.keys(updates).length > 0) {
              await monitoredDb.collection('logos').updateOne(
                { _id: logo._id },
                { $set: updates }
              );
              stats.logos.fixed++;
              console.log(chalk.green(`✓ Fixed logo ${logo._id}`));
            } else {
              stats.logos.skipped++;
            }
          } catch (error) {
            stats.logos.failed++;
            console.error(chalk.red(`✗ Failed to fix logo ${logo._id}: ${error}`));
          }
        } else {
          stats.logos.skipped++;
          console.log(chalk.yellow(`⚠️ Logo ${logo._id} has non-auto-fixable issues`));
        }
      }
    }

    // Step 4: Validate relationships
    console.log(chalk.blue('\nValidating relationships...'));
    const relationshipValidation = validateRelationships(users, logos);

    if (relationshipValidation.errors.length > 0 || relationshipValidation.warnings.length > 0) {
      console.log(chalk.yellow('\nRelationship issues found:'));
      relationshipValidation.errors.forEach(error => {
        console.log(chalk.red(`✗ ${error.message}`));
        if (error.details) {
          console.log(chalk.gray(JSON.stringify(error.details, null, 2)));
        }
      });

      relationshipValidation.warnings.forEach(warning => {
        console.log(chalk.yellow(`⚠️ ${warning.message}`));
        if (warning.details) {
          console.log(chalk.gray(JSON.stringify(warning.details, null, 2)));
        }
      });
    }

    // Step 5: Generate quality report
    const validationResults = new Map([
      ['users', users.map(u => validateUser(u))],
      ['logos', logos.map(l => validateLogo(l, userIds))]
    ]);

    const qualityReport = await generateQualityReport(client, db.databaseName, validationResults);
    console.log(formatQualityReport(qualityReport));
    console.log(generateRecommendations(qualityReport));

    // Step 6: Print performance report
    const performanceReport = performanceMonitor.generateReport();
    console.log(performanceMonitor.formatReport(performanceReport));
    console.log(performanceMonitor.generateRecommendations(performanceReport));

  } catch (error) {
    console.error(chalk.red('\n✗ Migration failed:'), error);
    throw error;
  }

  // Print summary
  console.log(chalk.blue('\n📊 Migration Summary'));
  Object.entries(stats).forEach(([collection, collectionStats]) => {
    console.log(chalk.bold(`\n${collection}:`));
    console.log(chalk.gray(`Processed: ${collectionStats.processed}`));
    console.log(chalk.green(`Fixed: ${collectionStats.fixed}`));
    console.log(chalk.red(`Failed: ${collectionStats.failed}`));
    console.log(chalk.yellow(`Skipped: ${collectionStats.skipped}`));
  });
}

// Main execution
if (require.main === module) {
  (async () => {
    const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017';
    const dbName = process.env.DB_NAME || 'LogoGalleryDB';
    
    console.log(chalk.blue(`\n🔌 Connecting to database: ${dbName}`));
    
    try {
      const client = await MongoClient.connect(uri);
      const db = client.db(dbName);
      
      await validateAndFix(client, db);
      
      await client.close();
      console.log(chalk.green('\n✅ Migration completed successfully'));
    } catch (error) {
      console.error(chalk.red('\n❌ Migration failed:'), error);
      process.exit(1);
    }
  })();
} 