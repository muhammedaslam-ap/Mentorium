"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorRepository = void 0;
const mongoose_1 = __importStar(require("mongoose"));
const tutorProfileModel_1 = require("../models/tutorProfileModel");
const userModel_1 = require("../models/userModel");
const notificationModel_1 = require("../models/notificationModel");
const buyCourseModal_1 = require("../models/buyCourseModal");
const course_1 = require("../models/course");
class TutorRepository {
    createTutorProfile(tutorId, profileData, verificationDocUrl) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingProfile = yield tutorProfileModel_1.tutorProfileModel.findOne({ tutorId });
            if (existingProfile) {
                throw new Error("Tutor profile already exists.");
            }
            const newProfile = {
                tutorId,
                name: profileData.name,
                specialization: profileData.specialization,
                verificationDocUrl: verificationDocUrl || '',
                phone: profileData.phone,
                bio: profileData.bio,
                approvalStatus: "pending",
            };
            console.log(newProfile);
            console.log('createTutorProfile - New profile data:', newProfile);
            yield tutorProfileModel_1.tutorProfileModel.create(newProfile);
        });
    }
    getTutorProfile(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            return tutorProfileModel_1.tutorProfileModel.findOne({ tutorId }).exec();
        });
    }
    updateTutorProfile(tutorId, profileData) {
        return __awaiter(this, void 0, void 0, function* () {
            yield tutorProfileModel_1.tutorProfileModel.updateOne({ tutorId }, { $set: profileData });
        });
    }
    updateRejectedReason(id, reason) {
        return __awaiter(this, void 0, void 0, function* () {
            yield tutorProfileModel_1.tutorProfileModel.updateOne({ tutorId: id }, { rejectionReason: reason, approvalStatus: "rejected" });
        });
    }
    getEnrolledStudent(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('getEnrolledStudent called with tutorId:', tutorId);
            if (!mongoose_1.Types.ObjectId.isValid(tutorId)) {
                console.log('Invalid tutorId:', tutorId);
                return { students: [], totalRevenue: 0 };
            }
            const tutorObjectId = new mongoose_1.default.Types.ObjectId(tutorId);
            // Step 1: Find all courses created by this tutor
            const tutorCourses = yield course_1.courseModel.find({ tutorId: tutorObjectId });
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
            const courseMap = new Map();
            tutorCourses.forEach((course) => {
                courseMap.set(course._id.toString(), course.title);
            });
            const courseIds = tutorCourses.map((course) => course._id);
            console.log('Course IDs:', courseIds.map(id => id.toString()));
            // Step 2: Find purchases for these courses
            const purchases = yield buyCourseModal_1.purchaseModel.find({
                "purchase.courseId": { $in: courseIds },
            });
            console.log('Purchases found:', purchases.length, JSON.stringify(purchases.map(p => {
                var _a;
                return ({
                    userId: (_a = p.userId) === null || _a === void 0 ? void 0 : _a.toString(),
                    purchase: p.purchase.map(item => {
                        var _a;
                        return ({
                            courseId: (_a = item.courseId) === null || _a === void 0 ? void 0 : _a.toString(),
                            amount: item.amount,
                            createdAt: item.createdAt,
                        });
                    }),
                });
            }), null, 2));
            let totalRevenue = 0;
            const studentDataMap = new Map();
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
                        studentDataMap.get(userId).courses.push({
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
            const studentObjectIds = studentIds.map((id) => new mongoose_1.default.Types.ObjectId(id));
            const students = yield userModel_1.userModel.find({
                _id: { $in: studentObjectIds },
            }, { name: 1, email: 1, role: 1 });
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
                    studentDataMap.get(userId).name = student.name || 'Unknown';
                    studentDataMap.get(userId).email = student.email || 'N/A';
                    studentDataMap.get(userId).role = student.role || 'student';
                }
            });
            // Step 6: Format the response according to TStudent type
            const result = [];
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
        });
    }
    getTutorDetails(id) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d, _e, _f;
            if (!mongoose_1.Types.ObjectId.isValid(id))
                return null;
            const tutor = yield userModel_1.userModel
                .aggregate([
                { $match: { _id: new mongoose_1.Types.ObjectId(id), role: "tutor" } },
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
            if (!tutor || tutor.length === 0)
                return null;
            const tutorData = tutor[0];
            return {
                _id: tutorData._id,
                name: tutorData.name,
                email: tutorData.email,
                role: tutorData.role,
                specialization: ((_a = tutorData.tutorProfile) === null || _a === void 0 ? void 0 : _a.specialization) || "",
                verificationDocUrl: ((_b = tutorData.tutorProfile) === null || _b === void 0 ? void 0 : _b.verificationDocUrl) || "",
                approvalStatus: ((_c = tutorData.tutorProfile) === null || _c === void 0 ? void 0 : _c.approvalStatus) || "pending",
                phone: ((_d = tutorData.tutorProfile) === null || _d === void 0 ? void 0 : _d.phone) || "",
                isBlocked: tutorData.isBlocked,
                bio: ((_e = tutorData.tutorProfile) === null || _e === void 0 ? void 0 : _e.bio) || "",
                rejectionReason: ((_f = tutorData.tutorProfile) === null || _f === void 0 ? void 0 : _f.rejectionReason) || "",
            };
        });
    }
    markAllNotificationsAsRead(id) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notificationModel_1.NotificationModel.updateMany({ userId: id }, { $set: { read: true } });
        });
    }
    getNotifications(id) {
        return __awaiter(this, void 0, void 0, function* () {
            const notifications = yield notificationModel_1.NotificationModel.find({ userId: id }).sort({ createdAt: -1 }).lean();
            if (!notifications)
                return null;
            return notifications.map((doc) => {
                var _a;
                return ({
                    _id: doc._id.toString(),
                    userId: doc.userId.toString(),
                    type: doc.type,
                    message: doc.message,
                    reason: doc.reason,
                    read: doc.read,
                    createdAt: doc.createdAt,
                    communityId: doc.communityId,
                    courseTitle: doc.courseTitle,
                    senderId: (_a = doc.senderId) === null || _a === void 0 ? void 0 : _a.toString(),
                });
            });
        });
    }
    markNotificationAsRead(userId, notificationId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield notificationModel_1.NotificationModel.updateOne({ _id: notificationId, userId }, { $set: { read: true } });
        });
    }
    getCommunityMembers(communityId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("Fetching community members for communityId:", communityId);
                const purchases = yield buyCourseModal_1.purchaseModel.find({
                    "purchase.courseId": communityId,
                });
                const userIds = purchases.map((p) => p.userId.toString());
                console.log("Community members found:", userIds);
                return userIds;
            }
            catch (error) {
                console.error("Error fetching community members:", error);
                return [];
            }
        });
    }
    saveCommunityNotifications(communityId, notificationData, userIds) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("saveCommunityNotifications:", {
                communityId,
                notificationData,
                userIds,
            });
            const users = yield this.getCommunityMembers(communityId);
            if (!users.length) {
                console.warn("No user IDs provided for notifications");
                return;
            }
            if (!mongoose_1.Types.ObjectId.isValid(notificationData.senderId)) {
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
                const isValid = mongoose_1.Types.ObjectId.isValid(userId);
                if (!isValid)
                    console.warn("Invalid userId filtered:", userId);
                return isValid;
            })
                .map((userId) => {
                const notification = {
                    userId: new mongoose_1.Types.ObjectId(userId),
                    type: notificationData.type,
                    message: notificationData.message,
                    communityId: notificationData.communityId,
                    courseTitle: notificationData.courseTitle,
                    senderId: new mongoose_1.Types.ObjectId(notificationData.senderId),
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
                yield notificationModel_1.NotificationModel.insertMany(notifications);
                console.log("Notifications saved successfully:", notifications.length);
            }
            catch (error) {
                console.error("Failed to save notifications:", error);
                throw new Error(`Failed to save notifications: ${error.message}`);
            }
        });
    }
    fetchTutorDataRepository(tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!mongoose_1.default.Types.ObjectId.isValid(tutorId)) {
                throw new Error("Invalid tutorId");
            }
            const tutorProfile = yield tutorProfileModel_1.tutorProfileModel.findOne({ tutorId }).lean();
            if (!tutorProfile) {
                throw new Error("Tutor profile not found");
            }
            const courses = yield course_1.courseModel.find({ tutorId }).lean();
            const formattedTutorProfile = Object.assign(Object.assign({}, tutorProfile), { tutorId: tutorProfile.tutorId.toString() });
            const formattedCourses = courses.map(course => (Object.assign(Object.assign({}, course), { tutorId: course.tutorId.toString(), _id: course._id.toString() })));
            return {
                tutorProfile: formattedTutorProfile,
                courses: formattedCourses,
            };
        });
    }
}
exports.TutorRepository = TutorRepository;
