import { validateEnvironmentVars } from './utils/env-validator';

async function validateStandards(): Promise<void> {
  try {
    console.log('Starting validation of project standards...');

    // Validate environment variables
    console.log('\nValidating environment variables...');
    const envPath = process.env.NODE_ENV === 'test' ? '.env.test' : '.env.development';
    validateEnvironmentVars(envPath);
    console.log('✓ Environment variables are valid');

    // Add more validation steps here as needed
    // For example:
    // - Validate database connection
    // - Check required directories exist
    // - Verify file permissions
    // - Check configuration files

    console.log('\n✓ All validation checks passed successfully');
  } catch (error) {
    console.error(
      '\n❌ Validation failed:',
      error instanceof Error ? error.message : 'Unknown error'
    );
    process.exit(1);
  }
}

// Run validation if this script is executed directly
if (require.main === module) {
  validateStandards();
}
