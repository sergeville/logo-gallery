import dbConnect from './db-config';

interface EnvironmentCheck {
  isDev: boolean;
  isTest: boolean;
  mongoUri: string | undefined;
  nodeEnv: string;
  dbName: string;
}

const DB_NAMES = {
  development: 'LogoGalleryDevelopmentDB',
  test: 'LogoGalleryTestDB',
  production: 'LogoGalleryDB'
} as const;

export async function checkEnvironment(): Promise<EnvironmentCheck> {
  const nodeEnv = process.env.NODE_ENV || 'development';
  const isDev = nodeEnv === 'development';
  const isTest = nodeEnv === 'test';
  const mongoUri = process.env.MONGODB_URI;
  const dbName = DB_NAMES[nodeEnv as keyof typeof DB_NAMES] || DB_NAMES.development;

  console.log('\n🔍 Environment Check:');
  console.log('===================');
  console.log(`📌 Node Environment: ${nodeEnv}`);
  console.log(`📌 Development Mode: ${isDev ? 'Yes' : 'No'}`);
  console.log(`📌 Test Mode: ${isTest ? 'Yes' : 'No'}`);
  console.log(`📌 Database Name: ${dbName}`);
  console.log(`📌 MongoDB URI: ${mongoUri ? 'Configured' : 'Missing'}`);

  if (nodeEnv === 'production') {
    console.error('❌ ERROR: Production environment detected!');
    console.error('This application should not run in production environment.');
    console.error('Please use development or test environment only.');
    throw new Error('Production environment not allowed');
  }

  return { isDev, isTest, mongoUri, nodeEnv, dbName };
}

export async function verifyDatabaseConnection() {
  try {
    console.log('\n🔄 Verifying database connection...');
    console.log('==============================');
    await dbConnect();
    
    // Get the current database name from the connection
    const dbName = (await dbConnect()).connection.name;
    console.log(`📊 Connected to database: ${dbName}`);
    
    // Verify we're using the correct database for the environment
    const expectedDbName = DB_NAMES[process.env.NODE_ENV as keyof typeof DB_NAMES] || DB_NAMES.development;
    if (dbName !== expectedDbName) {
      throw new Error(`Wrong database! Connected to "${dbName}" but should be using "${expectedDbName}" for ${process.env.NODE_ENV} environment`);
    }

    console.log('✅ Database connection successful');
    return true;
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    return false;
  }
}

export async function runInitialChecks() {
  console.log('\n🚀 Running initial environment checks...');
  console.log('===================================');
  
  try {
    const env = await checkEnvironment();

    if (!env.mongoUri) {
      console.error('❌ MongoDB URI not configured!');
      console.error('Please check your .env.local or .env.development file');
      return false;
    }

    // Verify the database name in the MongoDB URI matches the expected name
    const uriDbName = env.mongoUri.split('/').pop()?.split('?')[0];
    if (uriDbName && uriDbName !== env.dbName) {
      console.error('❌ MongoDB URI database name mismatch!');
      console.error(`Expected: ${env.dbName}`);
      console.error(`Found in URI: ${uriDbName}`);
      console.error('Please update your MongoDB URI to use the correct database name');
      return false;
    }

    const dbConnected = await verifyDatabaseConnection();
    if (!dbConnected) {
      console.error('❌ Unable to connect to MongoDB!');
      console.error('Please check if MongoDB is running and accessible');
      return false;
    }

    console.log('\n✅ All initial checks passed!');
    console.log('Environment Summary:');
    console.log('-------------------');
    console.log(`🔹 Environment: ${env.nodeEnv}`);
    console.log(`🔹 Database: ${env.dbName}`);
    console.log('-------------------\n');
    return true;
  } catch (error) {
    console.error('\n❌ Initial checks failed:', error);
    return false;
  }
} 