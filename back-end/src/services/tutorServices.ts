import { S3 } from 'aws-sdk';
import { TTutorProfileInput, TutorProfileWithCourses } from '../types/tutor';
import { ITutorProfile } from '../models/tutorProfileModel';
import { TutorRepository } from '../repositories/tutorRepository';
import { S3Client, HeadObjectCommand, DeleteObjectCommand } from '@aws-sdk/client-s3';
import { MulterS3File } from '../types/multer';
import  TNotification  from '../types/notification';
import { TStudent } from '../types/user';
import { userModel } from '../models/userModel';

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


  async updateTutorProfile(
    tutorId: string | undefined,
    profileData: Partial<TTutorProfileInput>,
    file?: MulterS3File
  ) {
    if (!tutorId) {
      console.error("updateTutorProfile - Tutor ID is required");
      throw new Error("Tutor ID is required");
    }

   const updateData: Partial<TTutorProfileInput> = {
     ...profileData,
    approvalStatus: "pending",
    rejectionReason: "", 
  };

    let newVerificationDocUrl: string | undefined;
    let newKey: string | undefined;
    let oldKey: string | undefined;

    if (file) {
      newVerificationDocUrl = file.location;
      newKey = file.key;

      try {
        await s3Client.send(
          new HeadObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME || "mentorium",
            Key: newKey,
          })
        );
        console.log(`New file verified in S3: ${newKey}`);
      } catch (error: any) {
        console.error(`Failed to verify new S3 file: ${newKey}`, error);
        throw new Error(`Failed to verify uploaded document in S3: ${error.message}`);
      }

      try {
        const currentProfile = await this.tutorRepository.getTutorProfile(tutorId);
        console.log(`Current profile for tutorId: ${tutorId}`, {
          verificationDocUrl: currentProfile?.verificationDocUrl,
        });

        if (currentProfile?.verificationDocUrl) {
          const urlParts = currentProfile.verificationDocUrl.split("/");
          oldKey = urlParts.slice(3).join("/");
        }
      } catch (error: any) {
        console.error(`Failed to fetch current profile for tutorId: ${tutorId}`, error);
      }

      updateData.verificationDocUrl = newVerificationDocUrl;
    }

    console.log(`Preparing to update profile for tutorId: -----${tutorId}`, { updateData });

    try {
      await this.tutorRepository.updateTutorProfile(tutorId, updateData);

      await userModel.updateOne({ _id: tutorId }, { isAccepted: false });

      console.log(`Profile updated successfully for tutorId:------------ ${tutorId}`, { updateData });

      if (oldKey && newVerificationDocUrl) {
        try {
          await s3Client.send(
            new DeleteObjectCommand({
              Bucket: process.env.S3_BUCKET_NAME || "mentorium",
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
              Bucket: process.env.S3_BUCKET_NAME || "mentorium",
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



  async  getEnrolledStudent(
       tutorId: string
     ): Promise<{ students: TStudent[]; totalRevenue: number }>{
      const { students, totalRevenue } =
        await this.tutorRepository.getEnrolledStudent(tutorId);
      return {students,totalRevenue};
  }
  async markAllNotificationsAsRead(id: string): Promise<void> {
    await this.tutorRepository.markAllNotificationsAsRead(id);
  }

  async getNotification(id: string): Promise<TNotification[] | null> {
    return await this.tutorRepository.getNotifications(id);
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    await this.tutorRepository.markNotificationAsRead(userId, notificationId);
  }

  async sendCommunityNotifications(
    communityId: string,
    senderId: string,
    message: { sender: string; content: string },
    courseTitle: string
  ): Promise<void> {
    const userIds = await this.getCommunityMembers(communityId);
    const filteredUserIds = userIds.filter((id) => id !== senderId);
    console.log("helloowoowww from sendCommunication notification")

    await this.tutorRepository.saveCommunityNotifications(
      communityId,
      {
        type: "chat_message",
        message: `${message.sender} sent a message: ${
          message.content ? message.content.slice(0, 50) + "..." : "Sent an image"
        }`,
        communityId,
        courseTitle,
        senderId,
        createdAt: new Date(),
      },
      filteredUserIds
    );
  }

  private async getCommunityMembers(communityId: string): Promise<string[]> {

    return [];
  }

  async getTutorProfileWithCourses(tutorId: string): Promise<TutorProfileWithCourses> {
    return await this.tutorRepository.fetchTutorDataRepository(tutorId);
  }
  
}