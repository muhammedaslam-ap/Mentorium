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
exports.LessonController = void 0;
const constant_1 = require("../shared/constant");
class LessonController {
    constructor(lessonService) {
        this.lessonService = lessonService;
    }
    addLesson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { title, courseId, description, duration, order } = req.body;
                console.log('addLesson - Request body:', { title, courseId, description, duration, order });
                console.log('addLesson - Request file:', req.file);
                if (!tutorId) {
                    console.error('addLesson - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                if (!req.file) {
                    console.error('addLesson - No video file uploaded');
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.MISSING_PARAMETERS });
                    return;
                }
                if (!title || !courseId || !description) {
                    console.error('addLesson - Missing required fields');
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.INCOMPLETE_INFO });
                    return;
                }
                const lessonData = {
                    title,
                    courseId,
                    description,
                    file: '',
                    duration: duration ? Number(duration) : undefined,
                    order: order ? Number(order) : undefined,
                };
                const lesson = yield this.lessonService.addLesson(tutorId, lessonData, req.file);
                console.log(`Lesson added for courseId: ${courseId}`);
                res.status(constant_1.HTTP_STATUS.CREATED).json({ message: constant_1.SUCCESS_MESSAGES.CREATED, lesson });
            }
            catch (error) {
                console.error('Error adding lesson:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getLesson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lessonId = req.params.lessonId;
                console.log(`getLesson - Fetching lesson with ID: ${lessonId}`);
                const lesson = yield this.lessonService.getLessonById(lessonId);
                if (!lesson) {
                    console.log(`Lesson not found: ${lessonId}`);
                    res.status(constant_1.HTTP_STATUS.NOT_FOUND).json({ message: constant_1.ERROR_MESSAGES.USER_NOT_FOUND });
                    return;
                }
                console.log(`Lesson fetched:`, lesson);
                res.status(constant_1.HTTP_STATUS.OK).json({ lesson, message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
            }
            catch (error) {
                console.error('Error fetching lesson:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getLessonsByCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const courseId = req.params.courseId;
                console.log(`getLessonsByCourse - Fetching lessons for courseId: ${courseId}`);
                const lessons = yield this.lessonService.getLessonsByCourseId(courseId);
                console.log(`Lessons fetched for courseId: ${courseId}`, lessons);
                res.status(constant_1.HTTP_STATUS.OK).json({ lessons, message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
            }
            catch (error) {
                console.error('Error fetching lessons:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    updateLesson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const lessonId = req.params.lessonId;
                const { title, description, duration, order } = req.body;
                console.log('updateLesson - Request body:', { title, description, duration, order });
                console.log('updateLesson - Request file:', req.file);
                if (!tutorId) {
                    console.error('updateLesson - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                const lessonData = {
                    title,
                    description,
                    duration: duration ? Number(duration) : undefined,
                    order: order ? Number(order) : undefined,
                };
                const lesson = yield this.lessonService.updateLesson(tutorId, lessonId, lessonData, req.file);
                console.log(`Lesson updated: ${lessonId}`);
                res.status(constant_1.HTTP_STATUS.OK).json({ message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS, lesson });
            }
            catch (error) {
                console.error('Error updating lesson:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    deleteLesson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const lessonId = req.params.lessonId;
                console.log(`deleteLesson - Deleting lesson with ID: ${lessonId}`);
                if (!tutorId) {
                    console.error('deleteLesson - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                yield this.lessonService.deleteLesson(tutorId, lessonId);
                console.log(`Lesson deleted: ${lessonId}`);
                res.status(constant_1.HTTP_STATUS.OK).json({ message: constant_1.SUCCESS_MESSAGES.DELETE_SUCCESS });
            }
            catch (error) {
                console.error('Error deleting lesson:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
}
exports.LessonController = LessonController;
