"use strict";
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
exports.PurchaseRepository = void 0;
const buyCourseModal_1 = require("../models/buyCourseModal");
const mongoose_1 = require("mongoose");
class PurchaseRepository {
    saveOrder(userId, data) {
        return __awaiter(this, void 0, void 0, function* () {
            let purchase = yield buyCourseModal_1.purchaseModel.findOne({ userId });
            if (purchase) {
                const purchaseExist = purchase.purchase.some((item) => item.courseId.toString() === data.courseId.toString());
                if (purchaseExist) {
                    return;
                }
                purchase.purchase.push({
                    courseId: data.courseId,
                    orderId: data.orderId,
                    amount: data.amount / 100,
                    status: "succeeded",
                });
                yield purchase.save();
                return;
            }
            else {
                purchase = yield buyCourseModal_1.purchaseModel.create({
                    userId,
                    purchase: [
                        {
                            courseId: data.courseId,
                            orderId: data.orderId,
                            amount: data.amount / 100,
                            status: "succeeded",
                        },
                    ],
                });
                return;
            }
        });
    }
    isEnrolled(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId || !courseId) {
                throw new Error("userID or CourseId are undefined");
            }
            const user = yield buyCourseModal_1.purchaseModel.findOne({ userId });
            if (!user) {
                return false;
            }
            const enrolled = user.purchase.some((curr) => curr.courseId.toString() === courseId.toString());
            console.log('finally here', enrolled);
            return enrolled;
        });
    }
    getEnrolledCourses(userId_1) {
        return __awaiter(this, arguments, void 0, function* (userId, page = 1, limit = 10) {
            if (!userId) {
                throw new Error("userId is required");
            }
            const enrolledCourses = yield buyCourseModal_1.purchaseModel
                .findOne({ userId })
                .populate("purchase.courseId")
                .lean();
            if (!enrolledCourses || !enrolledCourses.purchase) {
                return { courses: [], total: 0 };
            }
            const courses = enrolledCourses.purchase
                .filter((purchase) => purchase.courseId)
                .map((purchase) => purchase.courseId)
                .slice((page - 1) * limit, page * limit);
            return {
                courses,
                total: enrolledCourses.purchase.length,
            };
        });
    }
    getPurchaseHistory(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield buyCourseModal_1.purchaseModel.aggregate([
                { $match: { userId: new mongoose_1.Types.ObjectId(userId) } },
                { $unwind: "$purchase" },
                {
                    $lookup: {
                        from: "courses",
                        localField: "purchase.courseId",
                        foreignField: "_id",
                        as: "courseDetails"
                    }
                },
                { $unwind: "$courseDetails" },
                {
                    $project: {
                        courseId: "$purchase.courseId",
                        courseName: "$courseDetails.title",
                        amount: "$purchase.amount",
                        orderId: "$purchase.orderId",
                        status: "$purchase.status",
                        createdAt: "$purchase.createdAt"
                    }
                },
                { $sort: { createdAt: -1 } }
            ]);
            return result;
        });
    }
}
exports.PurchaseRepository = PurchaseRepository;
