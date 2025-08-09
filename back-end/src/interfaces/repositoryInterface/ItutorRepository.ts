import { ITutorProfile } from "../../models/tutorProfileModel";
import { TTutorModel, TTutorProfileInput, TutorProfileWithCourses } from "../../types/tutor";
import { TStudent } from "../../types/user";

interface TNotification {
  _id: string;
  userId: string;
  type: "approval" | "rejection" | "chat_message" | "call_request";
  message: string;
  reason?: string | null;
  read: boolean;
  createdAt: Date;
  communityId?: string | null;
  courseTitle?: string | null;
  senderId?: string | null;
}

export interface ITutorRepository {
  createTutorProfile(tutorId: string, profileData: TTutorProfileInput, verificationDocUrl?: string): Promise<void>;
  getTutorProfile(tutorId: string): Promise<ITutorProfile | null>;
  updateTutorProfile(tutorId: string, profileData: Partial<TTutorProfileInput>): Promise<void>;
  updateRejectedReason(id: string, reason: string): Promise<void>;
  getEnrolledStudent(tutorId: string): Promise<{ students: TStudent[]; totalRevenue: number }>;
  getTutorDetails(id: string): Promise<TTutorModel | null>;
  markAllNotificationsAsRead(id: string): Promise<void>;
  getNotifications(id: string): Promise<TNotification[] | null>;
  markNotificationAsRead(userId: string, notificationId: string): Promise<void>;
  getCommunityMembers(communityId: string): Promise<string[]>;
  saveCommunityNotifications(
    communityId: string,
    notificationData: {
      type: "chat_message";
      message: string;
      communityId: string;
      courseTitle: string;
      senderId: string;
      createdAt: Date;
    },
    userIds: string[]
  ): Promise<void>;
  fetchTutorDataRepository(tutorId: string): Promise<TutorProfileWithCourses>;
}
