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
exports.CourseRepository = void 0;
const course_1 = require("../models/course");
const tutorProfileModel_1 = require("../models/tutorProfileModel");
const userModel_1 = require("../models/userModel");
const buyCourseModal_1 = require("../models/buyCourseModal");
const mongoose_1 = require("mongoose");
class CourseRepository {
    findByIdAndTutor(courseId, tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield course_1.courseModel.findOne({ _id: courseId }).lean();
            if (!course) {
                return null;
            }
            const tutor = yield tutorProfileModel_1.tutorProfileModel.findOne({ tutorId: course.tutorId });
            const formattedCourse = {
                _id: course._id.toString(),
                title: course.title,
                tagline: course.tagline,
                category: course.category,
                difficulty: course.difficulty,
                price: course.price,
                about: course.about,
                thumbnail: course.thumbnail,
                tutorId: course.tutorId.toString(),
                tutor: {
                    name: tutor.name,
                    phone: tutor.phone,
                    specialization: tutor.specialization,
                    bio: tutor.bio
                }
            };
            return formattedCourse;
        });
    }
    getCourseDetails(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const course = yield course_1.courseModel.findById(courseId);
            return course;
        });
    }
    addCourse(data, thumbnail, tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield course_1.courseModel.create({
                title: data.title,
                tagline: data.tagline,
                category: data.category,
                difficulty: data.difficulty,
                price: data.price,
                about: data.about,
                thumbnail: thumbnail,
                tutorId: tutorId,
            });
        });
    }
    getTutorCourses(tutorId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('here is the tutor id in repo', tutorId);
            const courses = yield course_1.courseModel
                .find({ tutorId })
                .skip((page - 1) * limit)
                .limit(limit);
            const totalCourses = yield course_1.courseModel.countDocuments({ tutorId });
            console.log('here is the course of tutor =>>>>>', courses, totalCourses);
            return { courses, totalCourses };
        });
    }
    editCourse(data, thumbnail, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const updateData = {
                title: data.title,
                tagline: data.tagline,
                category: data.category,
                difficulty: data.difficulty,
                price: data.price,
                about: data.about,
            };
            if (thumbnail.trim() !== "") {
                updateData.thumbnail = thumbnail;
            }
            yield course_1.courseModel.findByIdAndUpdate(courseId, updateData);
        });
    }
    deleteCourse(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield course_1.courseModel.findByIdAndDelete({ _id: courseId });
        });
    }
    getAllStudents(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const purchases = yield buyCourseModal_1.purchaseModel.find({
                purchase: {
                    $elemMatch: {
                        courseId: new mongoose_1.Types.ObjectId(courseId),
                        status: "succeeded"
                    }
                }
            }).select("userId").lean();
            const userIds = purchases.map(p => p.userId);
            const uniqueUserIds = [...new Set(userIds.map(id => id.toString()))];
            const students = yield userModel_1.userModel.find({
                _id: { $in: uniqueUserIds }
            }).lean();
            console.log("studendetd", students, uniqueUserIds, userIds, purchases);
            return students;
        });
    }
    getAllCourses(options) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { page, limit, search, category, difficulty, minPrice, maxPrice, sort, } = options;
                const skip = (page - 1) * limit;
                const filters = {};
                if (search) {
                    filters.$or = [
                        { title: { $regex: search, $options: "i" } },
                        { tagline: { $regex: search, $options: "i" } },
                        { about: { $regex: search, $options: "i" } },
                    ];
                }
                if (category) {
                    const categories = category.split(",").map((c) => c.trim());
                    filters.category = { $in: categories };
                }
                if (difficulty) {
                    const difficulties = difficulty.split(",").map((d) => d.trim());
                    filters.difficulty = { $in: difficulties };
                }
                if (minPrice !== undefined || maxPrice !== undefined) {
                    filters.price = {};
                    if (minPrice !== undefined)
                        filters.price.$gte = minPrice;
                    if (maxPrice !== undefined)
                        filters.price.$lte = maxPrice;
                }
                let sortOption = {};
                switch (sort) {
                    case "popular":
                        sortOption = { enrollments: -1 };
                        break;
                    case "newest":
                        sortOption = { createdAt: -1 };
                        break;
                    case "price-low":
                        sortOption = { price: 1 };
                        break;
                    case "price-high":
                        sortOption = { price: -1 };
                        break;
                    default:
                        sortOption = { enrollments: -1 };
                }
                const courses = yield course_1.courseModel
                    .find(filters)
                    .sort(sortOption)
                    .skip(skip)
                    .limit(limit)
                    .lean();
                const total = yield course_1.courseModel.countDocuments(filters);
                return { courses, total };
            }
            catch (error) {
                console.error("Error fetching courses:", error);
                throw new Error("Failed to fetch courses");
            }
        });
    }
}
exports.CourseRepository = CourseRepository;
