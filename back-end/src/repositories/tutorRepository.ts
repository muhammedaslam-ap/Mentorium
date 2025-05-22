import { Types } from "mongoose";
import { ITutorRepository } from "../interfaces/repositoryInterface/ItutorRepository";
import { ITutorProfile, tutorProfileModel } from "../models/tutorProfileModel";
import { userModel } from "../models/userModel";
import { TTutorModel, TTutorProfileInput } from "../types/tutor";
import { NotificationModel } from "../models/notificationModel";
import { purchaseModel } from "../models/buyCourseModal";


interface TNotification {
  _id: string;
  userId: string;
  type: "approval" | "rejection" | "chat_message";
  message: string;
  reason?: string | null;
  read: boolean;
  createdAt: Date;
  communityId?: string |null;
  courseTitle?: string |null;
  senderId?: string |null;
}


export class TutorRepository implements ITutorRepository {
  async createTutorProfile(
    tutorId: string,
    profileData: TTutorProfileInput,
    verificationDocUrl?: string
  ): Promise<void> {
    const existingProfile = await tutorProfileModel.findOne({ tutorId });

    if (existingProfile) {
      throw new Error("Tutor profile already exists.");
    }

    const newProfile = {
      tutorId,
      name:profileData.name,
      specialization: profileData.specialization,
      verificationDocUrl: verificationDocUrl || '',
      phone: profileData.phone,
      bio: profileData.bio,
      approvalStatus: "pending",
    };


   console.log(newProfile)
    console.log('createTutorProfile - New profile data:', newProfile);

    await tutorProfileModel.create(newProfile);
  }

  async getTutorProfile(tutorId: string): Promise<ITutorProfile | null> {
    return tutorProfileModel.findOne({ tutorId }).exec();
  }

  async updateTutorProfile(tutorId: string, profileData: Partial<TTutorProfileInput>): Promise<void> {
    await tutorProfileModel.updateOne({ tutorId }, { $set: profileData });
  }

  async updateRejectedReason(id: string, reason: string): Promise<void> {
    await tutorProfileModel.updateOne(
      { tutorId: id },
      { rejectionReason: reason, approvalStatus: "rejected" }
    );
  }

  async getTutorDetails(id: string): Promise<TTutorModel | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const tutor = await userModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id), role: "tutor" } },
        {
          $lookup: {
            from: "tutorprofiles",
            localField: "_id",
            foreignField: "tutorId",
            as: "tutorProfile",
          },
        },
        {
          $unwind: { path: "$tutorProfile", preserveNullAndEmptyArrays: true },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            role: 1,
            "tutorProfile.specialization": 1,
            "tutorProfile.verificationDocUrl": 1,
            "tutorProfile.approvalStatus": 1,
            "tutorProfile.phone": 1,
            "tutorProfile.bio": 1,
            "tutorProfile.rejectionReason": 1,
          },
        },
      ])
      .exec();

    if (!tutor || tutor.length === 0) return null;

    const tutorData = tutor[0];
    return {
      _id: tutorData._id,
      name: tutorData.name,
      email: tutorData.email,
      role: tutorData.role,
      specialization: tutorData.tutorProfile?.specialization || "",
      verificationDocUrl: tutorData.tutorProfile?.verificationDocUrl || "",
      approvalStatus: tutorData.tutorProfile?.approvalStatus || "pending",
      phone: tutorData.tutorProfile?.phone || "",
      isBlocked: tutorData.isBlocked,
      bio: tutorData.tutorProfile?.bio || "",
      rejectionReason: tutorData.tutorProfile?.rejectionReason || "",
    };
  }

  async markAllNotificationsAsRead(id: string): Promise<void> {
    await NotificationModel.updateMany(
      { userId: id },
      { $set: { read: true } }
    );
  }

  async getNotifications(id: string): Promise<TNotification[] | null> {
    const notifications = await NotificationModel.find({ userId: id }).sort({ createdAt: -1 }).lean();
    if (!notifications) return null;
    
    return notifications.map((doc) => ({
      _id: doc._id.toString(),
      userId: doc.userId.toString(),
      type: doc.type,
      message: doc.message,
      reason: doc.reason,
      read: doc.read,
      createdAt: doc.createdAt,
      communityId: doc.communityId,
      courseTitle: doc.courseTitle,
      senderId: doc.senderId?.toString(),
    }));
  }

  async markNotificationAsRead(userId: string, notificationId: string): Promise<void> {
    await NotificationModel.updateOne(
      { _id: notificationId, userId },
      { $set: { read: true } }
    );
  }

  async getCommunityMembers(communityId: string): Promise<string[]> {
    try {
      console.log("Fetching community members for communityId:", communityId);

      const purchases = await purchaseModel.find({
        "purchase.courseId": communityId,
      });

      const userIds = purchases.map((p) => p.userId.toString());

      console.log("Community members found:", userIds);
      return userIds;
    } catch (error) {
      console.error("Error fetching community members:", error);
      return [];
    }
  }

  async saveCommunityNotifications(
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
  ): Promise<void> {
    console.log("saveCommunityNotifications:", {
      communityId,
      notificationData,
      userIds,
    });

    const users = await this.getCommunityMembers(communityId);
    if (!users.length) {
      console.warn("No user IDs provided for notifications");
      return;
    }
    if (!Types.ObjectId.isValid(notificationData.senderId)) {
      console.error("Invalid senderId:", notificationData.senderId);
      throw new Error("Invalid senderId");
    }

    const receiverUserIds = users.filter((userId) => userId !== notificationData.senderId);
    console.log("Receiver userIds (after excluding sender):", receiverUserIds);

    if (!receiverUserIds.length) {
      console.warn("No receiver user IDs after excluding sender for community:", communityId);
      return;
    }

    const notifications = receiverUserIds
      .filter((userId) => {
        const isValid = Types.ObjectId.isValid(userId);
        if (!isValid) console.warn("Invalid userId filtered:", userId);
        return isValid;
      })
      .map((userId) => {
        const notification = {
          userId: new Types.ObjectId(userId),
          type: notificationData.type,
          message: notificationData.message,
          communityId: notificationData.communityId,
          courseTitle: notificationData.courseTitle,
          senderId: new Types.ObjectId(notificationData.senderId),
          createdAt: notificationData.createdAt,
          read: false,
        };
        console.log("Prepared notification for userId:", userId, notification);
        return notification;
      });

    if (!notifications.length) {
      console.warn("No valid notifications to save");
      return;
    }

    try {
      console.log("Attempting to save notifications:", notifications);
      await NotificationModel.insertMany(notifications);
      console.log("Notifications saved successfully:", notifications.length);
    } catch (error: any) {
      console.error("Failed to save notifications:", error);
      throw new Error(`Failed to save notifications: ${error.message}`);
    }
  }
}
  