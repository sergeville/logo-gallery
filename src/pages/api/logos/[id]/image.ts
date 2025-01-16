import { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/app/lib/db';
import { Logo } from '@/app/lib/types';
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
    const logosCollection = db.collection<Logo>('logos');

    const logo = await logosCollection.findOne({ _id: new ObjectId(id) });
    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }

    const imagePath = path.join(process.cwd(), 'public', logo.imageUrl);
    const ext = path.extname(imagePath).slice(1).toLowerCase();
    const contentType = contentTypes[ext] || 'image/jpeg';

    try {
      const imageBuffer = await fs.readFile(imagePath);
      res.setHeader('Content-Type', contentType);
      res.send(imageBuffer);
    } catch (error) {
      console.error('Error reading image file:', error);
      res.status(404).json({ message: 'Image file not found' });
    }
  } catch (error) {
    console.error('Error serving logo image:', error);
    res.status(500).json({ message: 'Error serving logo image' });
  }
} 