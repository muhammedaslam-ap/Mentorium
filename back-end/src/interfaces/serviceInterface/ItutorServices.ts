import { TTutorProfileInput, TutorProfileWithCourses } from '../../types/tutor';
import { ITutorProfile } from '../../models/tutorProfileModel';
import { MulterS3File } from '../../types/multer';
import TNotification from '../../types/notification';
import { TStudent } from '../../types/user';

export interface ITutorService {
  addTutorProfile(
    tutorId: string,
    profileData: TTutorProfileInput,
    verificationDocUrl?: string
  ): Promise<void>;

  getTutorProfile(tutorId: string): Promise<ITutorProfile | null>;

  getPresignedUrl(key: string): Promise<string>;

  updateTutorProfile(
    tutorId: string | undefined,
    profileData: Partial<TTutorProfileInput>,
    file?: MulterS3File
  ): Promise<void>;

  getEnrolledStudent(
    tutorId: string
  ): Promise<{ students: TStudent[]; totalRevenue: number }>;

  markAllNotificationsAsRead(id: string): Promise<void>;

  getNotification(id: string): Promise<TNotification[] | null>;

  markNotificationAsRead(userId: string, notificationId: string): Promise<void>;

  sendCommunityNotifications(
    communityId: string,
    senderId: string,
    message: { sender: string; content: string },
    courseTitle: string
  ): Promise<void>;

  getTutorProfileWithCourses(tutorId: string): Promise<TutorProfileWithCourses>;
}
