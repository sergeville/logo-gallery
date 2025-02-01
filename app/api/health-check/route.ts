import { NextResponse } from 'next/server';
import dbConnect from '@/app/lib/db-config';
import { checkEnvironment } from '@/app/lib/init-checks';

export async function GET() {
  try {
    // Check environment
    const env = await checkEnvironment();
    if (!env.isDev) {
      console.warn('Warning: Not running in development environment');
    }

    // Try to connect to the database
    await dbConnect();

    // Return comprehensive health status
    return NextResponse.json(
      {
        status: 'healthy',
        environment: {
          nodeEnv: env.nodeEnv,
          isDevelopment: env.isDev,
          mongoDbConfigured: !!env.mongoUri
        },
        database: {
          status: 'connected',
          uri: env.isDev ? env.mongoUri : 'hidden in production'
        },
        timestamp: new Date().toISOString()
      },
      { 
        status: 200,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  } catch (error) {
    console.error('Health check failed:', error);
    return NextResponse.json(
      {
        status: 'unhealthy',
        error: process.env.NODE_ENV === 'development' ? error.message : 'Internal Server Error',
        timestamp: new Date().toISOString()
      },
      { 
        status: 503,
        headers: {
          'Cache-Control': 'no-store, must-revalidate',
          'Pragma': 'no-cache'
        }
      }
    );
  }
} 