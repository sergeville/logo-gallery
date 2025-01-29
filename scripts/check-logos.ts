import { connectToDatabase } from '@/lib/mongodb';
import { Logo } from '@/app/models/Logo';
import chalk from 'chalk';

async function checkLogos() {
  console.log(chalk.blue('\n=== Checking Logo URLs ===\n'));

  try {
    // Connect to database
    const { db } = await connectToDatabase();
    const logosCollection = db.collection<Logo>('logos');

    // Get all logos from database
    const logos = await logosCollection.find({}).toArray();
    console.log(`Found ${chalk.yellow(logos.length)} logos in database.\n`);

    // Print each logo's URL
    logos.forEach(logo => {
      console.log(chalk.gray(`${logo._id}: ${logo.imageUrl}`));
    });

    console.log(chalk.green('\n✓ Check completed!\n'));
  } catch (error) {
    console.error(chalk.red('\nError during check:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  checkLogos();
}

export { checkLogos }; 