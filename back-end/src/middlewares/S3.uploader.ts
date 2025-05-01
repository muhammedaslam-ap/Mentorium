import { S3Client } from '@aws-sdk/client-s3';
import { Request, Response } from 'express';
import multer from 'multer';
import multerS3 from 'multer-s3';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

// Sanitize file name to remove spaces and special characters
const sanitizeFileName = (fileName: string) => {
  return fileName
    .replace(/[^a-zA-Z0-9.-]/g, '_')
    .replace(/_+/g, '_')
    .toLowerCase();
};

const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: process.env.S3_BUCKET_NAME || 'mentorium',
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    contentType: multerS3.AUTO_CONTENT_TYPE, // Automatically set ContentType
    key: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const sanitizedFileName = sanitizeFileName(path.basename(file.originalname, ext));
      const fileName = `${uuidv4()}${ext}`;
      const key = `verification-documents/${fileName}`;
      console.log(`Uploading file to S3 with key: ${key} (original: ${file.originalname})`);
      cb(null, key);
    },
  }),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Invalid file type. Only JPEG, PNG, and PDF are allowed.'));
  },
}).single('verificationDoc');

const uploadMiddleware = (req: Request, res: Response, next: Function) => {
  upload(req, res, (err) => {
    if (err) {
      console.error('S3 upload error:', err.message);
      return res.status(500).json({ message: 'Failed to upload file to S3' });
    }
    next();
  });
};

export default uploadMiddleware;