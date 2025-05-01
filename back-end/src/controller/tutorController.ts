import { Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { TTutorProfileInput } from '../types/tutor';
import { MulterS3File } from '../types/multer';
import { TutorService } from '../services/tutorServices';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export class TutorController {
  constructor(private tutorService: TutorService) {}

  async addTutorProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { name, specialization, phone, bio } = req.body;

      console.log('addTutorProfile - Full request body:', req.body);
      console.log('addTutorProfile - Extracted fields:', { name, specialization, phone, bio });
      console.log('addTutorProfile - Request file:', req.file);

      if (!tutorId) {
        console.error('addTutorProfile - No tutor ID found');
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
        return;
      }
      if (!specialization) {
        console.error('addTutorProfile - Specialization is required');
        res.status(400).json({ message: 'Specialization is required' });
        return;
      }
      if (!phone) {
        console.error('addTutorProfile - Phone number is required');
        res.status(400).json({ message: 'Phone number is required' });
        return;
      }
      if (!req.file) {
        console.error('addTutorProfile - No verification document uploaded');
        res.status(400).json({ message: 'No verification document uploaded' });
        return;
      }

      const file = req.file as MulterS3File;
      const verificationDocUrl = file.location;
      const key = file.key;

      console.log(`Verifying S3 file existence for key: ${key} (URL: ${verificationDocUrl})`);
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
            Key: key,
          })
        );
        console.log(`File verified in S3: ${key}`);
      } catch (error: any) {
        console.error(`Failed to verify S3 file: ${key}`, error);
        res.status(500).json({ message: 'Failed to verify uploaded document in S3' });
        return;
      }

      const profileData: TTutorProfileInput = {
        name,
        specialization,
        phone,
        bio,
        verificationDocUrl
      };

      try {
        await this.tutorService.addTutorProfile(tutorId, profileData, verificationDocUrl);
        console.log(`Tutor profile created for tutorId: ${tutorId}, verificationDocUrl: ${verificationDocUrl}`);
        res.status(201).json({ message: 'Tutor profile created successfully', document: verificationDocUrl });
      } catch (error: any) {
        console.error('Failed to save tutor profile:', error.message);
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
              Key: key,
            })
          );
          console.log(`Deleted S3 file: ${key} due to profile creation failure`);
        } catch (deleteError) {
          console.error(`Failed to delete S3 file: ${key}`, deleteError);
        }
        res.status(500).json({ message: 'Failed to create tutor profile' });
      }
    } catch (error: any) {
      console.error('Error adding tutor profile:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getTutorProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      console.log(`Fetching profile for tutorId: ${tutorId}`);
      const profile = await this.tutorService.getTutorProfile(tutorId);

      if (!profile) {
        console.log(`Profile not found for tutorId: ${tutorId}`);
        res.status(404).json({ message: 'Tutor profile not found' });
        return;
      }

      console.log(`Profile fetched:`, profile);
      res.status(200).json({ profile });
    } catch (error: any) {
      console.error('Error fetching tutor profile:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateTutorProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { name, specialization, phone, bio } = req.body;
      console.log(`Updating profile for tutorId: ${tutorId}`, { name, specialization, phone, bio });
      console.log('updateTutorProfile - Request file:', req.file);

      if (!tutorId) {
        console.error('updateTutorProfile - No tutor ID found');
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
        return;
      }

      const profileData: Partial<TTutorProfileInput> = { name, specialization, phone, bio };

      await this.tutorService.updateTutorProfile(tutorId, profileData, req.file as MulterS3File);
      console.log(`Profile updated for tutorId: ${tutorId}`);
      res.status(200).json({
        message: 'Tutor profile updated successfully',
        document: req.file ? (req.file as MulterS3File).location : undefined,
      });
    } catch (error: any) {
      console.error('Error updating tutor profile:', error.message);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  async getDocumentPresignedUrl(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      console.log(`Generating pre-signed URL for tutorId: ${tutorId}`);
      const profile = await this.tutorService.getTutorProfile(tutorId);

      if (!profile || !profile.verificationDocUrl) {
        console.log(`No document found for tutorId: ${tutorId}`);
        res.status(404).json({ message: 'Document not found' });
        return;
      }

      const urlParts = profile.verificationDocUrl.split('/');
      const key = urlParts.slice(3).join('/');
      console.log(`Generating pre-signed URL for key: ${key}`);

      const presignedUrl = await this.tutorService.getPresignedUrl(key);
      console.log(`Pre-signed URL generated: ${presignedUrl}`);
      res.status(200).json({ url: presignedUrl });
    } catch (error: any) {
      console.error('Error generating pre-signed URL:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }
}