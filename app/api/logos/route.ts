import { NextResponse } from 'next/server';
import { getLogos } from '../../lib/store';

export async function GET() {
  try {
    const logos = getLogos();
    
    return NextResponse.json({
      logos,
      pagination: {
        current: 1,
        total: 1,
        hasMore: false
      }
    });

  } catch (error) {
    console.error('Error in logos API:', error);
    return NextResponse.json(
      { message: 'Failed to fetch logos' },
      { status: 500 }
    );
  }
} 