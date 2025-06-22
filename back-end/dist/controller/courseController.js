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
exports.CourseController = void 0;
const custom_error_1 = require("../utils/custom.error");
const cloudinary_1 = require("cloudinary");
const cloudinaryURL_1 = require("../utils/cloudinaryURL");
const constant_1 = require("../shared/constant");
class CourseController {
    constructor(_courseService) {
        this._courseService = _courseService;
    }
    addCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutor = req.user;
                let publicId = "";
                if (req.file) {
                    const timestamp = Math.round(new Date().getTime() / 1000);
                    const signature = cloudinary_1.v2.utils.api_sign_request({
                        timestamp,
                        folder: "course_thumbnails",
                        access_mode: "authenticated",
                    }, process.env.CLOUDINARY_API_SECRET);
                    const uploadResult = yield new Promise((resolve, reject) => {
                        const stream = cloudinary_1.v2.uploader.upload_stream({
                            resource_type: "auto",
                            folder: "course_thumbnails",
                            access_mode: "authenticated",
                            timestamp,
                            signature,
                            api_key: process.env.CLOUDINARY_API_KEY,
                        }, (error, result) => {
                            if (error)
                                return reject(error);
                            resolve(result);
                        });
                        if (req.file) {
                            stream.end(req.file.buffer);
                        }
                    });
                    publicId = uploadResult.public_id;
                    console.log("Uploaded Secure Image Public ID:", publicId);
                }
                yield this._courseService.addCourse(req.body, publicId, tutor === null || tutor === void 0 ? void 0 : tutor.id);
                res.status(201).json({
                    success: true,
                    message: "Course created successfully",
                });
            }
            catch (error) {
                console.error(error);
                res.status(500).json({ success: false, message: "Internal Server Error" });
            }
        });
    }
    getCourseById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const { courseId } = req.params;
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log(courseId, userId);
                if (!courseId || !userId) {
                    res.status(400).json({ success: false, message: 'Invalid courseId or userId' });
                    return;
                }
                const result = yield this._courseService.getCourseById(courseId, userId);
                console.log(result);
                res.status(result.statusCode).json({
                    success: result.success,
                    message: result.message || '',
                    course: result.course,
                });
            }
            catch (error) {
                console.error('Error in getCourseById controller:', error);
                res.status(500).json({ success: false, message: 'Internal server error' });
            }
        });
    }
    getTutorCourses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const tutor = req.user;
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                console.log('here is the tutor id in service', tutor.id);
                const { courses, totalCourses } = yield this._courseService.getTutorCourses(tutor.id, page, limit);
                const updatedCourses = courses
                    ? yield Promise.all(courses.map((course) => __awaiter(this, void 0, void 0, function* () {
                        if (course.thumbnail) {
                            console.log("COURSE THUMBNAIL", course.thumbnail);
                            course.thumbnail = yield (0, cloudinaryURL_1.createSecureUrl)(course.thumbnail, 'image');
                        }
                        return course;
                    })))
                    : [];
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    courses: updatedCourses,
                    totalCourses,
                });
            }
            catch (error) {
                console.error("Error in getTutorCourses:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
    updateCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                let publicId = "";
                if (req.file) {
                    const timestamp = Math.round(new Date().getTime() / 1000);
                    const signature = cloudinary_1.v2.utils.api_sign_request({
                        timestamp,
                        folder: "course_thumbnails",
                        access_mode: "authenticated",
                    }, process.env.CLOUDINARY_API_SECRET);
                    const uploadResult = yield new Promise((resolve, reject) => {
                        const stream = cloudinary_1.v2.uploader.upload_stream({
                            resource_type: "auto",
                            folder: "course_thumbnails",
                            access_mode: "authenticated",
                            timestamp,
                            signature,
                            api_key: process.env.CLOUDINARY_API_KEY,
                        }, (error, result) => {
                            if (error)
                                return reject(error);
                            resolve(result);
                        });
                        if (req.file) {
                            stream.end(req.file.buffer);
                        }
                    });
                    publicId = uploadResult.public_id;
                    console.log("Uploaded Secure Image Public ID:", publicId);
                }
                yield this._courseService.updateCourse(req.body, publicId, courseId.toString());
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    deleteCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                yield this._courseService.deleteCourse(courseId);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DELETE_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getAllStudents(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                if (!courseId) {
                    return res.status(400).json({
                        success: false,
                        message: "Course ID is required",
                    });
                }
                const students = yield this._courseService.getAllStudents(courseId);
                console.log("HYYYYYYYYY", students);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    students,
                });
            }
            catch (error) {
                console.error(error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
    getAllCourses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            try {
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.trim()) || "";
                const category = ((_b = req.query.category) === null || _b === void 0 ? void 0 : _b.trim()) || "";
                const difficulty = ((_c = req.query.difficulty) === null || _c === void 0 ? void 0 : _c.trim()) || "";
                const minPriceStr = req.query.minPrice;
                const maxPriceStr = req.query.maxPrice;
                const sort = ((_d = req.query.sort) === null || _d === void 0 ? void 0 : _d.trim()) || "";
                // Validate numeric query parameters
                const minPrice = minPriceStr ? parseInt(minPriceStr) : 0;
                const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : 1500;
                if (isNaN(minPrice) || isNaN(maxPrice)) {
                    throw new custom_error_1.CustomError("Invalid price range", constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                if (minPrice < 0 || maxPrice < minPrice) {
                    throw new custom_error_1.CustomError("Invalid price range values", constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                const { courses, total } = yield this._courseService.getAllCourses({
                    page,
                    limit,
                    search,
                    category,
                    difficulty,
                    minPrice,
                    maxPrice,
                    sort,
                });
                const updatedCourses = courses
                    ? yield Promise.all(courses.map((course) => __awaiter(this, void 0, void 0, function* () {
                        if (course.thumbnail) {
                            console.log("COURSE THUMBNAIL", course.thumbnail);
                            course.thumbnail = yield (0, cloudinaryURL_1.createSecureUrl)(course.thumbnail, "image");
                        }
                        return course;
                    })))
                    : [];
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    courses: { courses: updatedCourses, total },
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
}
exports.CourseController = CourseController;
