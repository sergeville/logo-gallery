import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import fs from 'fs';
import path from 'path';

export const config = {
  api: {
    bodyParser: false,
  },
};

const uploadDir = path.join(process.cwd(), 'public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const form = formidable({
      uploadDir,
      keepExtensions: true,
      maxFiles: 1,
      filename: (name, ext) => `${Date.now()}-${name}${ext}`,
    });

    form.parse(req, async (err, fields, files) => {
      if (err) {
        console.error('Upload error:', err);
        return res.status(500).json({ message: 'Error uploading file' });
      }

      const file = files.file?.[0];
      if (!file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }

      // Ensure file was saved
      if (!fs.existsSync(file.filepath)) {
        return res.status(500).json({ message: 'File not saved' });
      }

      const relativePath = `/uploads/${path.basename(file.filepath)}`;
      
      res.status(200).json({
        url: relativePath,
        name: file.originalFilename,
        path: relativePath
      });
    });
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ message: 'Server error' });
  }
} 