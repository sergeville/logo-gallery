import type { NextApiRequest, NextApiResponse } from 'next';
import { Logo } from '@/models/Logo';
import { connectDB } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    try {
      const logos = await Logo.find()
        .populate('userId', 'username profileImage')
        .sort({ createdAt: -1 })
        .lean();

      // Add sample data if no logos exist
      if (logos.length === 0) {
        const sampleLogos = [
          {
            _id: '1',
            name: 'Jardinscampion Logo',
            url: 'https://jardinscampion.com/wp-content/uploads/2024/03/logo-jardinscampion.png',
            description: 'Official Jardinscampion logo',
            userId: {
              username: 'admin',
              profileImage: 'https://placehold.co/50x50'
            },
            tags: ['official', 'brand', 'company'],
            averageRating: 5.0
          },
          {
            _id: '2',
            name: 'Jardinscampion Icon',
            url: 'https://jardinscampion.com/wp-content/uploads/2024/03/icon-jardinscampion.png',
            description: 'Jardinscampion icon version',
            userId: {
              username: 'admin',
              profileImage: 'https://placehold.co/50x50'
            },
            tags: ['icon', 'brand', 'minimal'],
            averageRating: 4.8
          }
        ];

        return res.json({
          logos: sampleLogos,
          pagination: {
            current: 1,
            total: 1,
            hasMore: false
          }
        });
      }

      res.json({
        logos,
        pagination: {
          current: 1,
          total: 1,
          hasMore: false
        }
      });
    } catch (error) {
      console.error('Error fetching logos:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } 
  
  else if (req.method === 'POST') {
    try {
      const logo = new Logo(req.body);
      await logo.save();
      res.status(201).json(logo);
    } catch (error) {
      console.error('Error creating logo:', error);
      res.status(500).json({ message: 'Error creating logo' });
    }
  } 
  
  else {
    res.status(405).json({ message: 'Method not allowed' });
  }
}