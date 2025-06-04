import mongoose, { Types } from "mongoose";
import { ITutorRepository } from "../interfaces/repositoryInterface/ItutorRepository";
import { ITutorProfile, tutorProfileModel } from "../models/tutorProfileModel";
import { userModel } from "../models/userModel";
import { TTutorModel, TTutorProfileInput, TutorProfileWithCourses } from "../types/tutor";
import { NotificationModel } from "../models/notificationModel";
import { purchaseModel } from "../models/buyCourseModal";
import { courseModel } from "../models/course";
import { TStudent } from "../types/user";


interface TNotification {
  _id: string;
  userId: string;
  type: "approval" | "rejection" | "chat_message" |"call_request";
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


async getEnrolledStudent(
  tutorId: string
  ): Promise<{ students: TStudent[]; totalRevenue: number }> {
  console.log('getEnrolledStudent called with tutorId:', tutorId);

  if (!Types.ObjectId.isValid(tutorId)) {
    console.log('Invalid tutorId:', tutorId);
    return { students: [], totalRevenue: 0 };
  }

  const tutorObjectId = new mongoose.Types.ObjectId(tutorId);

  // Step 1: Find all courses created by this tutor
  const tutorCourses = await courseModel.find({ tutorId: tutorObjectId });
  console.log('Tutor courses found:', tutorCourses.length, JSON.stringify(tutorCourses.map(c => ({
    _id: c._id.toString(),
    title: c.title,
    tutorId: c.tutorId.toString(),
  })), null, 2));

  // If tutor has no courses, return empty array and zero revenue
  if (!tutorCourses.length) {
    console.log('No courses found for tutorId:', tutorId);
    return { students: [], totalRevenue: 0 };
  }

  const courseMap = new Map<string, string>();
  tutorCourses.forEach((course) => {
    courseMap.set(course._id.toString(), course.title);
  });

  const courseIds = tutorCourses.map((course) => course._id);
  console.log('Course IDs:', courseIds.map(id => id.toString()));

  // Step 2: Find purchases for these courses
  const purchases = await purchaseModel.find({
    "purchase.courseId": { $in: courseIds },
  });
  console.log('Purchases found:', purchases.length, JSON.stringify(purchases.map(p => ({
    userId: p.userId?.toString(),
    purchase: p.purchase.map(item => ({
      courseId: item.courseId?.toString(),
      amount: item.amount,
      createdAt: item.createdAt,
    })),
  })), null, 2));

  let totalRevenue = 0;
  const studentDataMap = new Map<
    string,
    {
      name: string;
      email: string;
      role: string;
      courses: { course: string; purchaseDate: Date; amount: number }[];
    }
  >();

  purchases.forEach((purchase) => {
    if (!purchase.userId) {
      console.log('Skipping purchase with no userId:', purchase._id.toString());
      return;
    }

    const userId = purchase.userId.toString();
    purchase.purchase.forEach((item) => {
      if (!item.courseId) {
        console.log('Skipping purchase item with no courseId:', item.orderId);
        return;
      }

      if (courseIds.some((courseId) => courseId.equals(item.courseId))) {
        const courseIdStr = item.courseId.toString();
        const courseName = courseMap.get(courseIdStr) || "Unknown Course";
        const amount = item.amount || 0;

        // Add to total revenue
        totalRevenue += amount;
        console.log('Adding to totalRevenue:', { courseId: courseIdStr, amount, totalRevenue });

        if (!studentDataMap.has(userId)) {
          studentDataMap.set(userId, {
            name: "",
            email: "",
            role: "",
            courses: [],
          });
        }

        studentDataMap.get(userId)!.courses.push({
          course: courseName,
          purchaseDate: item.createdAt || purchase._id.getTimestamp(),
          amount: amount,
        });
      }
    });
  });

  console.log('Student data map after purchases:', studentDataMap.size, JSON.stringify([...studentDataMap], null, 2));

  // Step 4: Fetch student details for these IDs
  const studentIds = Array.from(studentDataMap.keys());
  const studentObjectIds = studentIds.map(
    (id) => new mongoose.Types.ObjectId(id)
  );

  const students = await userModel.find(
    {
      _id: { $in: studentObjectIds },
    },
    { name: 1, email: 1, role: 1 }
  );
  console.log('Students fetched:', students.length, JSON.stringify(students.map(s => ({
    _id: s._id.toString(),
    name: s.name,
    email: s.email,
    role: s.role,
  })), null, 2));

  // Step 5: Combine student details with course purchase data
  students.forEach((student) => {
    const userId = student._id.toString();
    if (studentDataMap.has(userId)) {
      studentDataMap.get(userId)!.name = student.name || 'Unknown';
      studentDataMap.get(userId)!.email = student.email || 'N/A';
      studentDataMap.get(userId)!.role = student.role || 'student';
    }
  });

  // Step 6: Format the response according to TStudent type
  const result: TStudent[] = [];
  studentDataMap.forEach((data, userId) => {
    data.courses.forEach((courseData) => {
      result.push({
        _id: userId,
        name: data.name,
        email: data.email,
        role: data.role,
        course: courseData.course,
        purchaseDate: courseData.purchaseDate,
        amount: courseData.amount,
      });
    });
  });

  console.log('Final result:', { students: result.length, totalRevenue }, JSON.stringify(result, null, 2));
  return { students: result, totalRevenue };
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

    async fetchTutorDataRepository(tutorId: string): Promise<TutorProfileWithCourses> {
      if (!mongoose.Types.ObjectId.isValid(tutorId)) {
        throw new Error("Invalid tutorId")
      }

      const tutorProfile = await tutorProfileModel.findOne({ tutorId }).lean()
      if (!tutorProfile) {
        throw new Error("Tutor profile not found")
      }

      const courses = await courseModel.find({ tutorId }).lean()

      const formattedTutorProfile = {
        ...tutorProfile,
        tutorId: tutorProfile.tutorId.toString(),
      }

      const formattedCourses = courses.map(course => ({
        ...course,
        tutorId: course.tutorId.toString(),
        _id: course._id.toString(),
      }))

      return {
        tutorProfile: formattedTutorProfile,
        courses: formattedCourses,
    }
  }
}



  