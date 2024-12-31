import type { NextApiRequest, NextApiResponse } from 'next';
import { Logo } from '@/models/Logo';
import { connectDB } from '@/lib/db';
import { authMiddleware } from '@/middleware/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  await connectDB();

  if (req.method === 'GET') {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;

    try {
      const logos = await Logo.find()
        .populate('userId', 'username profileImage')
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .lean();

      const total = await Logo.countDocuments();

      res.json({
        logos,
        pagination: {
          current: page,
          total: Math.ceil(total / limit),
          hasMore: skip + logos.length < total
        }
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error' });
    }
  }
}