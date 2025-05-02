import { S3 } from 'aws-sdk';
import { TTutorProfileInput } from '../types/tutor';
import { ITutorProfile } from '../models/tutorProfileModel';
import { TutorRepository } from '../repositories/tutorRepository';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { MulterS3File } from '../types/multer';

const s3Client = new S3Client({
  region: process.env.AWS_REGION || 'ap-south-1',
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || '',
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || '',
  },
});

export class TutorService {
  private tutorRepository: TutorRepository;

  constructor(tutorRepository: TutorRepository) {
    this.tutorRepository = tutorRepository;
  }

  async addTutorProfile(tutorId: string, profileData: TTutorProfileInput, verificationDocUrl?: string): Promise<void> {
    return this.tutorRepository.createTutorProfile(tutorId, profileData, verificationDocUrl);
  }

  async getTutorProfile(tutorId: string): Promise<ITutorProfile | null> {
    return this.tutorRepository.getTutorProfile(tutorId);
  }

  async getPresignedUrl(key: string): Promise<string> {
    const s3 = new S3({
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
      region: process.env.AWS_REGION,
    });

    return s3.getSignedUrl('getObject', {
      Bucket: process.env.S3_BUCKET_NAME || '',
      Key: key,
      Expires: 60 * 5,
    });
  }

  async updateTutorProfile(tutorId: string | undefined, profileData: Partial<TTutorProfileInput>, file?: MulterS3File) {
    if (!tutorId) {
      console.error('updateTutorProfile - Tutor ID is required');
      throw new Error('Tutor ID is required');
    }

    const updateData: Partial<TTutorProfileInput> = { ...profileData };
    let newVerificationDocUrl: string | undefined;
    let newKey: string | undefined;
    let oldKey: string | undefined;

    if (file) {
      newVerificationDocUrl = file.location;
      newKey = file.key;

      console.log(`Verifying new S3 file:---------- ${newKey} (URL:-------------- ${newVerificationDocUrl})`);
      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
            Key: newKey,
          })
        );
        console.log(`New file verified in S3: ${newKey}`);
      } catch (error: any) {
        console.error(`Failed to verify new S3 file: ${newKey}`, error);
        throw new Error(`Failed to verify uploaded document in S3: ${error.message}`);
      }

      // Get old verificationDocUrl to delete
      try {
        const currentProfile = await this.tutorRepository.getTutorProfile(tutorId);
        console.log(`Current profile for tutorId: ${tutorId}`, {
          verificationDocUrl: currentProfile?.verificationDocUrl,
        });
        if (currentProfile?.verificationDocUrl) {
          const urlParts = currentProfile.verificationDocUrl.split('/');
          oldKey = urlParts.slice(3).join('/');
          console.log(`Old S3 file to delete:------------ ${oldKey}`);
        }
      } catch (error: any) {
        console.error(`Failed to fetch current profile for tutorId: ${tutorId}`, error);
      }

      updateData.verificationDocUrl = newVerificationDocUrl;
    }

    // Log updateData before database update
    console.log(`Preparing to update profile for tutorId: -----${tutorId}`, { updateData });

    try {
      await this.tutorRepository.updateTutorProfile(tutorId, updateData);
      console.log(`Profile updated successfully for tutorId:------------ ${tutorId}`, { updateData });

      // Delete old S3 file if it exists
      if (oldKey && newVerificationDocUrl) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
              Key: oldKey,
            })
          );
          console.log(`Deleted old S3 file: ${oldKey}`);
        } catch (deleteError: any) {
          console.error(`Failed to delete old S3 file: ${oldKey}`, deleteError);
        }
      }
    } catch (error: any) {
      console.error(`Failed to update tutor profile for tutorId: ${tutorId}`, error);
      if (newKey) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || 'mentorium',
              Key: newKey,
            })
          );
          console.log(`Deleted new S3 file due to update failure: ${newKey}`);
        } catch (deleteError: any) {
          console.error(`Failed to delete new S3 file: ${newKey}`, deleteError);
        }
      }
      throw new Error(`Failed to update tutor profile: ${error.message}`);
    }
  }
}