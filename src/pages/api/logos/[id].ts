import { NextApiRequest, NextApiResponse } from 'next';
import { Logo } from '../../../../app/lib/store';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  if (typeof id !== 'string') {
    return res.status(400).json({ message: 'Invalid logo ID' });
  }

  if (req.method === 'GET') {
    try {
      // Get logo from store
      const logo = Logo.findById(id);
      if (!logo) {
        return res.status(404).json({ message: 'Logo not found' });
      }
      res.status(200).json(logo);
    } catch (error) {
      res.status(500).json({ message: 'Error retrieving logo' });
    }
  } else {
    res.setHeader('Allow', ['GET']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
} 

