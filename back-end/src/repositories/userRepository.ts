import { userModel } from "../models/userModel";
import {
  TPaginationOptions,
  TUpdatePassword,
  TUserModel,
  TUserRegister,
  TUserWithProfile,
} from "../types/user";
import { IUserRepository } from "../interfaces/repositoryInterface/IuserRepository";

import { Types } from "mongoose";
import { tutorProfileModel } from "../models/tutorProfileModel";
import { TUserPaginatedResult } from "../types/user";

export class UserRepository implements IUserRepository {
  async createUser(data: TUserRegister): Promise<TUserModel> {
    const userData = await userModel.create(data);
    return userData;
  }

  async findByEmail(email: string): Promise<TUserModel | null> {
    console.log(email)
    return await userModel.findOne({ email });
  }

  async resetPassword(data: TUpdatePassword): Promise<boolean> {
    const updated = await userModel.findOneAndUpdate(
      { email: data.email },
      { password: data.newPassword },
      { new: true }
    );
    return !!updated;
  }

  async updatePassword(id: string, newPassword: string): Promise<boolean> {
    const updated = await userModel.findByIdAndUpdate(
      id,
      { password: newPassword },
      { new: true }
    );
    return !!updated;
  }

  async findById(id: string): Promise<TUserWithProfile | null> {
    if (!Types.ObjectId.isValid(id)) return null;

    const user = await userModel
      .aggregate([
        { $match: { _id: new Types.ObjectId(id) } },
        {
          $lookup: {
            from: "userprofiles",
            localField: "_id",
            foreignField: "userId",
            as: "userProfile",
          },
        },
        {
          $unwind: {
            path: "$userProfile",
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            name: 1,
            email: 1,
            password: 1,
            role: 1,
            isBlocked: 1,
            isAccepted: 1,
            "userProfile.education": 1,
            "userProfile.aboutMe": 1,
            "userProfile.interests": 1,
          },
        },
      ])
      .exec();

    if (!user || user.length === 0) return null;

    const userData = user[0];
    return {
      _id: userData._id,
      name: userData.name,
      email: userData.email,
      password: userData.password || null,
      role: userData.role || "student",
      isBlocked: userData.isBlocked || false,
      isAccepted: userData.isAccepted || false,
      education: userData.userProfile?.education || "",
      aboutMe: userData.userProfile?.aboutMe || "",
      interests: userData.userProfile?.interests || "",
    };
  }

  async acceptTutor(tutorId: string): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: tutorId }, { isAccepted: true });
    await tutorProfileModel.updateOne(
      { tutorId: tutorId },
      { approvalStatus: "approved" }
    );

  }

  
  async updateStatus(id: string, status: boolean): Promise<void> {
    await userModel.findByIdAndUpdate({ _id: id }, { isBlocked: status });
  }


  async getUsers({
    page,
    pageSize,
    search,
    role,
  }: TPaginationOptions): Promise<TUserPaginatedResult> {
    const query: Record<string, unknown> = {};
    if (role) query.role = role;
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
      ];
    }

    const skip = (page - 1) * pageSize;
    const users = await userModel
      .aggregate([
        { $match: query },
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
            isBlocked: 1,
            lastActive: 1,
            "tutorProfile.specialization": 1,
            "tutorProfile.verificationDocUrl": 1,
            "tutorProfile.approvalStatus": 1,
            "tutorProfile.phone": 1,
            "tutorProfile.bio": 1,
          },
        },
        { $skip: skip },
        { $limit: pageSize },
      ])
      .exec();

    const total = await userModel.countDocuments(query);
    const totalPages = Math.ceil(total / pageSize);

    const flattenedUsers = users.map((user) => ({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      isBlocked: user.isBlocked || false,
      specialization: user.tutorProfile?.specialization || "",
      verificationDocUrl: user.tutorProfile?.verificationDocUrl || "",
      approvalStatus: user.tutorProfile?.approvalStatus || "pending",
      phone: user.tutorProfile?.phone || "",
      bio: user.tutorProfile?.bio || "",
    }));

    return { data: flattenedUsers, total, page, pageSize,totalPages };
  }
}
