import { NextApiRequest, NextApiResponse } from 'next';
import { Logo } from '../../../../../app/lib/store';
import { join } from 'path';
import { readFile } from 'fs/promises';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { id } = req.query;

    if (typeof id !== 'string') {
      return res.status(400).json({ message: 'Invalid logo ID' });
    }

    const logo = Logo.findById(id);

    if (!logo) {
      return res.status(404).json({ message: 'Logo not found' });
    }

    // Extract filename from URL
    const filename = logo.url.split('/').pop();
    if (!filename) {
      return res.status(404).json({ message: 'Image file not found' });
    }

    // Read file from uploads directory
    const filePath = join(process.cwd(), 'uploads', filename);
    const imageBuffer = await readFile(filePath);

    // Set appropriate content type based on file extension
    const ext = filename.split('.').pop()?.toLowerCase();
    const contentType = {
      'png': 'image/png',
      'jpg': 'image/jpeg',
      'jpeg': 'image/jpeg',
      'gif': 'image/gif',
      'webp': 'image/webp'
    }[ext || 'jpeg'] || 'image/jpeg';

    res.setHeader('Content-Type', contentType);
    res.send(imageBuffer);
  } catch (error) {
    console.error('Error serving image:', error);
    res.status(500).json({ message: 'Error serving image' });
  }
} 