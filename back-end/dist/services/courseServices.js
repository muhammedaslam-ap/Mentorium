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
exports.CourseService = void 0;
const cloudinaryURL_1 = require("../utils/cloudinaryURL");
class CourseService {
    constructor(_courseRepository) {
        this._courseRepository = _courseRepository;
    }
    getCourseById(courseId, tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                if (!courseId || !tutorId) {
                    return { success: false, statusCode: 400, message: "Invalid courseId or tutorId" };
                }
                const course = yield this._courseRepository.findByIdAndTutor(courseId, tutorId);
                console.log(courseId, tutorId);
                if (!course) {
                    return { success: false, statusCode: 404, message: "Course not found or unauthorized" };
                }
                const secureThumbnail = yield (0, cloudinaryURL_1.createSecureUrl)(course.thumbnail, 'image');
                return {
                    success: true,
                    statusCode: 200,
                    course: {
                        _id: course._id.toString(),
                        title: course.title,
                        tagline: course.tagline,
                        category: course.category,
                        difficulty: course.difficulty,
                        price: course.price,
                        about: course.about,
                        thumbnail: secureThumbnail,
                        tutorId: course.tutorId.toString(),
                        tutor: {
                            name: course.tutor.name,
                            phone: course.tutor.phone,
                            specialization: course.tutor.specialization,
                            bio: course.tutor.bio
                        }
                    },
                };
            }
            catch (error) {
                console.error("CourseService Error:", error);
                return { success: false, statusCode: 500, message: "Server error" };
            }
        });
    }
    addCourse(data, thumbnail, tutorId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._courseRepository.addCourse(data, thumbnail, tutorId);
        });
    }
    getCourseDetails(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._courseRepository.getCourseDetails(courseId);
        });
    }
    getAllStudents(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("suiii", courseId);
            return this._courseRepository.getAllStudents(courseId);
        });
    }
    getTutorCourses(tutorId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('here is the tutor id in service', tutorId);
            const { courses, totalCourses } = yield this._courseRepository.getTutorCourses(tutorId, page, limit);
            return { courses, totalCourses };
        });
    }
    updateCourse(data, thumbnail, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._courseRepository.editCourse(data, thumbnail, courseId);
        });
    }
    deleteCourse(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this._courseRepository.deleteCourse(courseId);
        });
    }
    getAllCourses(options) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._courseRepository.getAllCourses(options);
        });
    }
}
exports.CourseService = CourseService;
