import type { NextApiRequest, NextApiResponse } from 'next';
import { Logo } from '@/models/Logo';
import { connectDB } from '@/lib/db';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  await connectDB();

  if (req.method === 'GET') {
    try {
      const logo = await Logo.findById(id)
        .populate('userId', 'username profileImage')
        .lean();

      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }

      res.json(logo);
    } catch (error) {
      console.error('Error fetching logo:', error);
      res.status(500).json({ message: 'Server error' });
    }
  } else {
    res.status(405).json({ message: 'Method not allowed' });
  }
} 

