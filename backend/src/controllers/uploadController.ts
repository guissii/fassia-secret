import { Request, Response } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import sharp from 'sharp';

// Configure multer to use memory storage so we can process the image with sharp
const storage = multer.memoryStorage();

// File filter to only allow images
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Not an image! Please upload an image.'));
  }
};

export const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter
});

export const handleUpload = async (req: Request, res: Response) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    const uploadDir = path.join(__dirname, '../../../public/uploads');
    
    // Ensure directory exists
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const baseName = req.file.originalname.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9.-]/g, '_');
    
    let filename: string;
    let outputPath: string;

    if (req.file.mimetype === 'image/webp') {
      // If already WebP, save it normally without re-encoding to preserve original quality
      filename = `${uniqueSuffix}-${baseName}.webp`;
      outputPath = path.join(uploadDir, filename);
      await fs.promises.writeFile(outputPath, req.file.buffer);
    } else {
      // Convert to WebP and optimize with high quality
      filename = `${uniqueSuffix}-${baseName}.webp`;
      outputPath = path.join(uploadDir, filename);
      await sharp(req.file.buffer)
        .webp({ quality: 90, effort: 6 }) // High quality, maximum compression effort
        .toFile(outputPath);
    }

    const url = `/uploads/${filename}`;
    res.json({ url });
  } catch (error) {
    console.error('Error processing image:', error);
    res.status(500).json({ error: 'Failed to process image' });
  }
};