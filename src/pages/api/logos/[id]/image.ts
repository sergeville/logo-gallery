import type { NextApiRequest, NextApiResponse } from 'next';
import { Logo } from '@/models/Logo';
import { connectDB } from '@/lib/db';

interface LogoType {
  _id: unknown;
  name: string;
  url: string;
  description?: string;
  userId: {
    username: string;
    profileImage: string;
  };
  tags: string[];
  averageRating: number;
  __v: number;
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  const { id } = req.query;
  await connectDB();

  if (req.method === 'GET') {
    try {
      console.log('Looking for logo with ID:', id);

      if (!id || typeof id !== 'string') {
        return res.status(400).json({ message: 'Invalid logo ID' });
      }

      const logo = await Logo.findById(id)
        .populate('userId', 'username profileImage')
        .lean() as unknown as LogoType;

      if (!logo) {
        console.log('Logo not found for ID:', id);
        return res.status(404).json({ 
          message: 'Logo not found',
          requestedId: id 
        });
      }

      res.setHeader('Content-Type', 'text/html');
      res.send(`
        <!DOCTYPE html>
        <html>
          <head>
            <title>${logo.name}</title>
            <style>
              body { margin: 0; padding: 20px; display: flex; justify-content: center; align-items: center; min-height: 100vh; background: #f5f5f5; }
              .image-container { background: white; padding: 20px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1); }
              img { max-width: 100%; height: auto; display: block; }
              .info { margin-top: 15px; text-align: center; font-family: system-ui, -apple-system, sans-serif; }
            </style>
          </head>
          <body>
            <div class="image-container">
              <img src="${logo.url}" alt="${logo.name}" width="400" height="380" />
              <div class="info">
                <h2>${logo.name}</h2>
                <p>${logo.description || ''}</p>
              </div>
            </div>
          </body>
        </html>
      `);
    } catch (error) {
      console.error('Error fetching logo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
};

export default handler; 