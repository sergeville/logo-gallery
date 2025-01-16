import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/app/lib/db';
import { Logo } from '@/app/lib/types';
import { ObjectId } from 'mongodb';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/app/lib/auth';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (!['GET', 'PUT', 'DELETE'].includes(req.method || '')) {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid logo ID' });
    }

    const { db } = await connectToDatabase();
    const logosCollection = db.collection<Logo>('logos');

    switch (req.method) {
      case 'GET': {
        const logo = await logosCollection.findOne({ _id: new ObjectId(id) });
        if (!logo) {
          return res.status(404).json({ message: 'Logo not found' });
        }
        return res.status(200).json(logo);
      }

      case 'PUT': {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const logo = await logosCollection.findOne({ _id: new ObjectId(id) });
        if (!logo) {
          return res.status(404).json({ message: 'Logo not found' });
        }

        if (logo.userId.toString() !== session.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }

        const { name, description, tags } = req.body;
        if (!name || !description || !tags) {
          return res.status(400).json({ message: 'Missing required fields' });
        }

        const result = await logosCollection.updateOne(
          { _id: new ObjectId(id) },
          {
            $set: {
              name,
              description,
              tags: Array.isArray(tags) ? tags : tags.split(',').map((tag: string) => tag.trim()),
              updatedAt: new Date()
            }
          }
        );

        if (result.matchedCount === 0) {
          return res.status(404).json({ message: 'Logo not found' });
        }

        return res.status(200).json({ message: 'Logo updated successfully' });
      }

      case 'DELETE': {
        const session = await getServerSession(req, res, authOptions);
        if (!session?.user?.email) {
          return res.status(401).json({ message: 'Not authenticated' });
        }

        const logo = await logosCollection.findOne({ _id: new ObjectId(id) });
        if (!logo) {
          return res.status(404).json({ message: 'Logo not found' });
        }

        if (logo.userId.toString() !== session.user.id) {
          return res.status(403).json({ message: 'Not authorized' });
        }

        const result = await logosCollection.deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
          return res.status(404).json({ message: 'Logo not found' });
        }

        return res.status(200).json({ message: 'Logo deleted successfully' });
      }
    }
  } catch (error) {
    console.error('Error handling logo request:', error);
    res.status(500).json({ message: 'Error handling logo request' });
  }
} 

