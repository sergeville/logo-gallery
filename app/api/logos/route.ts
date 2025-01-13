import { connectToDatabase } from '@/app/lib/db';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1');
    const limit = parseInt(url.searchParams.get('limit') || '10');

    // Validate pagination parameters
    if (page < 1 || limit < 1) {
      return new Response(
        JSON.stringify({
          success: false,
          message: 'Invalid pagination parameters'
        }),
        { status: 400, headers: { 'Content-Type': 'application/json' } }
      );
    }

    const db = await connectToDatabase();
    const collection = db.collection('logos');

    // Calculate skip value for pagination
    const skip = (page - 1) * limit;

    // Get total count
    const total = await collection.countDocuments();

    // Get paginated logos
    const logos = await collection
      .find()
      .skip(skip)
      .limit(limit)
      .toArray();

    // Calculate pagination info
    const totalPages = Math.ceil(total / limit);
    const hasMore = page < totalPages;

    return new Response(
      JSON.stringify({
        logos,
        pagination: {
          current: page,
          total: totalPages,
          hasMore
        }
      }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error fetching logos:', error);
    return new Response(
      JSON.stringify({
        success: false,
        message: 'Failed to fetch logos'
      }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    );
  }
} 