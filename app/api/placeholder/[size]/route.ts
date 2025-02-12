import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: { size: string } }
): Promise<NextResponse> {
  try {
    // Parse size parameter (format: "widthxheight" or single number for square)
    const [width, height] = params.size.split('x').map(Number);
    const imageWidth = width || 200;
    const imageHeight = height || width || 200;

    // Generate a placeholder SVG
    const svg = `
      <svg width="${imageWidth}" height="${imageHeight}" xmlns="http://www.w3.org/2000/svg">
        <rect width="100%" height="100%" fill="#f0f0f0"/>
        <text x="50%" y="50%" font-family="Arial" font-size="14" fill="#666"
          text-anchor="middle" dy=".3em">${imageWidth}x${imageHeight}</text>
      </svg>
    `;

    // Return the SVG with proper headers
    return new NextResponse(svg, {
      headers: {
        'Content-Type': 'image/svg+xml',
        'Cache-Control': 'public, max-age=31536000',
        'X-Content-Type-Options': 'nosniff',
      },
    });
  } catch (error) {
    console.error('Error generating placeholder:', error);
    return new NextResponse('Error generating placeholder image', { 
      status: 400,
      headers: {
        'Cache-Control': 'no-store',
      }
    });
  }
} 