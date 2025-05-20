import { Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { TTutorProfileInput } from '../types/tutor';
import { MulterS3File } from '../types/multer';
import { TutorService } from '../services/tutorServices';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../shared/constant';
import { CustomError } from '../utils/custom.error';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export class TutorController {
  constructor(private tutorService: TutorService) {}

    async getNotification(req: CustomRequest, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      const { id } = user;
      const notifications = await this.tutorService.getNotification(id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        notifications,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          successs: false,
          message: error.message,
        });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

    async markAllNotificationsAsRead(req: CustomRequest, res: Response) {
    try {
      
      const id = (req as CustomRequest).user.id;

      await this.tutorService.markAllNotificationsAsRead(id);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }


  async addTutorProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { name, specialization, phone, bio } = req.body;

      console.log('addTutorProfile - Full request body:', req.body);
      console.log('addTutorProfile - Extracted fields:', { name, specialization, phone, bio });
      console.log('addTutorProfile - Request file:', req.file);

      if (!tutorId) {
        console.error('addTutorProfile - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }
      if (!specialization) {
        console.error('addTutorProfile - Specialization is required');
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.INCOMPLETE_INFO });
        return;
      }
      if (!phone) {
        console.error('addTutorProfile - Phone number is required');
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.INCOMPLETE_INFO });
        return;
      }
      if (!req.file) {
        console.error('addTutorProfile - No verification document uploaded');
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.MISSING_PARAMETERS });
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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
        return;
      }

      const profileData: TTutorProfileInput = {
        name,
        specialization,
        phone,
        bio,
        verificationDocUrl,
      };

      try {
        await this.tutorService.addTutorProfile(tutorId, profileData, verificationDocUrl);
        console.log(`Tutor profile created for tutorId: ${tutorId}, verificationDocUrl: ${verificationDocUrl}`);
        res.status(HTTP_STATUS.CREATED).json({
          message: SUCCESS_MESSAGES.CREATED,
          document: verificationDocUrl,
        });
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
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
      }
    } catch (error: any) {
      console.error('Error adding tutor profile:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getTutorProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      console.log(`Fetching profile for tutorId: ${tutorId}`);
      const profile = await this.tutorService.getTutorProfile(tutorId);

      if (!profile) {
        console.log(`Profile not found for tutorId: ${tutorId}`);
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      console.log(`Profile fetched:`, profile);
      res.status(HTTP_STATUS.OK).json({ profile, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error('Error fetching tutor profile:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async updateTutorProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { name, specialization, phone, bio } = req.body;
      console.log(`Updating profile for tutorId: ${tutorId}`, { name, specialization, phone, bio });
      console.log('updateTutorProfile - Request file: ------------->', req.file);

      if (!tutorId) {
        console.error('updateTutorProfile - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      const profileData: Partial<TTutorProfileInput> = { name, specialization, phone, bio };

      await this.tutorService.updateTutorProfile(tutorId, profileData, req.file as MulterS3File);
      console.log(`Profile updated for tutorId: ${tutorId}`);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
        document: req.file ? (req.file as MulterS3File).location : undefined,
      });
    } catch (error: any) {
      console.error('Error updating tutor profile:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getDocumentPresignedUrl(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      console.log(`Generating pre-signed URL for tutorId: ${tutorId}`);
      const profile = await this.tutorService.getTutorProfile(tutorId);

      if (!profile || !profile.verificationDocUrl) {
        console.log(`No document found for tutorId: ${tutorId}`);
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      const urlParts = profile.verificationDocUrl.split('/');
      const key = urlParts.slice(3).join('/');
      console.log(`Generating pre-signed URL for key: ${key}`);

      const presignedUrl = await this.tutorService.getPresignedUrl(key);
      console.log(`Pre-signed URL generated: ${presignedUrl}`);
      res.status(HTTP_STATUS.OK).json({ url: presignedUrl, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error('Error generating pre-signed URL:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}