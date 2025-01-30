import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate the request body matches our types
    if (typeof body.data?.name !== 'string' || typeof body.data?.url !== 'string') {
      return NextResponse.json({ error: 'Invalid data format' }, { status: 400 });
    }

    return NextResponse.json({
      validated: true,
      data: body.data
    });
  } catch (error) {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 });
  }
} 