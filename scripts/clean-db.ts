import { connectToDatabase } from '../app/lib/db';
import { unlink } from 'fs/promises';
import { join } from 'path';
import chalk from 'chalk';

async function cleanDatabase() {
  console.log(chalk.blue('Starting database cleanup...'));
  
  try {
    const { db } = await connectToDatabase();
    
    // Get current state
    const users = await db.collection('users').countDocuments();
    const logos = await db.collection('logos').countDocuments();
    const logoCards = await db.collection('logoCards').countDocuments();
    
    console.log(chalk.cyan('Current state:'));
    console.log(`Users: ${users}`);
    console.log(`Logos: ${logos}`);
    console.log(`LogoCards: ${logoCards}`);
    
    // Remove all logos
    const deletedLogos = await db.collection('logos').deleteMany({});
    console.log(chalk.green(`Deleted ${deletedLogos.deletedCount} logos`));
    
    // Remove all logoCards
    const deletedLogoCards = await db.collection('logoCards').deleteMany({});
    console.log(chalk.green(`Deleted ${deletedLogoCards.deletedCount} logoCards`));
    
    // Clean up files in uploads directory
    const uploadDir = join(process.cwd(), 'public', 'uploads');
    try {
      const fs = require('fs');
      const files = fs.readdirSync(uploadDir);
      
      for (const file of files) {
        if (file !== '.gitkeep') {
          await unlink(join(uploadDir, file));
          console.log(chalk.green(`Deleted file: ${file}`));
        }
      }
    } catch (error) {
      console.error(chalk.red('Error cleaning up files:'), error);
    }
    
    // Final state
    const finalUsers = await db.collection('users').countDocuments();
    const finalLogos = await db.collection('logos').countDocuments();
    const finalLogoCards = await db.collection('logoCards').countDocuments();
    
    console.log(chalk.cyan('\nFinal state:'));
    console.log(`Users: ${finalUsers}`);
    console.log(`Logos: ${finalLogos}`);
    console.log(`LogoCards: ${finalLogoCards}`);
    
  } catch (error) {
    console.error(chalk.red('Error during cleanup:'), error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  cleanDatabase()
    .then(() => {
      console.log(chalk.green('\nCleanup completed successfully'));
      process.exit(0);
    })
    .catch((error) => {
      console.error(chalk.red('\nCleanup failed:'), error);
      process.exit(1);
    });
}

export { cleanDatabase }; 