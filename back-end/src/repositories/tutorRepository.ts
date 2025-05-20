import { Types } from "mongoose";
import { ITutorRepository } from "../interfaces/repositoryInterface/ItutorRepository";
import { ITutorProfile, tutorProfileModel } from "../models/tutorProfileModel";
import { userModel } from "../models/userModel";
import { TTutorModel, TTutorProfileInput } from "../types/tutor";
import { TNotification } from "../types/notification";
import { NotificationModel } from "../models/notificationModel";

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
    const notification = await NotificationModel.find({ userId: id });
    return notification as TNotification[];
  }
  
}