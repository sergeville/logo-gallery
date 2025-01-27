import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '../../../../../lib/db';
import { Logo } from '../../../../../lib/types';
import { ObjectId } from 'mongodb';
import fs from 'fs/promises';
import path from 'path';

const contentTypes: Record<string, string> = {
  'png': 'image/png',
  'jpg': 'image/jpeg',
  'jpeg': 'image/jpeg',
  'gif': 'image/gif',
  'webp': 'image/webp'
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const { id } = req.query;
    if (!id || typeof id !== 'string' || !ObjectId.isValid(id)) {
      return res.status(400).json({ message: 'Invalid logo ID' });
    }

    const { db } = await connectToDatabase();
    const logo = await db.collection<Logo>('logos').findOne({ _id: new ObjectId(id) });

    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }

    const filePath = path.join(process.cwd(), 'public', logo.imageUrl);
    const fileExt = path.extname(filePath).slice(1).toLowerCase();
    const contentType = contentTypes[fileExt] || 'application/octet-stream';

    try {
      const fileBuffer = await fs.readFile(filePath);
      res.setHeader('Content-Type', contentType);
      res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
      res.send(fileBuffer);
    } catch (error) {
      console.error('Error reading logo file:', error);
      return res.status(500).json({ message: 'Error reading logo file' });
    }
  } catch (error) {
    console.error('Error fetching logo:', error);
    return res.status(500).json({ message: 'Internal server error' });
  }
} 