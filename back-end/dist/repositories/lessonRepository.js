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
exports.LessonRepository = void 0;
const lessonModel_1 = require("../models/lessonModel");
class LessonRepository {
    createLesson(lessonData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log('createLesson - Creating lesson with file:', lessonData.file);
            yield lessonModel_1.lessonModel.create(lessonData);
            console.log('createLesson - Lesson created successfully');
        });
    }
    getLessonById(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b, _c, _d;
            console.log(`getLessonById - Fetching lesson with ID: ${lessonId}`);
            const lesson = yield lessonModel_1.lessonModel.findById(lessonId).lean().exec();
            if (!lesson) {
                console.log(`getLessonById - Lesson not found: ${lessonId}`);
                return null;
            }
            const transformedLesson = {
                _id: lesson._id.toString(),
                title: lesson.title,
                courseId: lesson.courseId.toString(),
                description: lesson.description,
                file: lesson.file,
                duration: (_a = lesson.duration) !== null && _a !== void 0 ? _a : undefined,
                order: (_b = lesson.order) !== null && _b !== void 0 ? _b : undefined,
                createdAt: (_c = lesson.createdAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
                updatedAt: (_d = lesson.updatedAt) === null || _d === void 0 ? void 0 : _d.toISOString(),
            };
            console.log(`getLessonById - Lesson fetched:`, transformedLesson);
            return transformedLesson;
        });
    }
    getLessonsByCourseId(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`getLessonsByCourseId - Fetching lessons for courseId: ${courseId}`);
            const lessons = yield lessonModel_1.lessonModel.find({ courseId }).sort({ order: 1 }).lean().exec();
            const transformedLessons = lessons.map((lesson) => {
                var _a, _b, _c, _d;
                return ({
                    _id: lesson._id.toString(),
                    title: lesson.title,
                    courseId: lesson.courseId.toString(),
                    description: lesson.description,
                    file: lesson.file,
                    duration: (_a = lesson.duration) !== null && _a !== void 0 ? _a : undefined,
                    order: (_b = lesson.order) !== null && _b !== void 0 ? _b : undefined,
                    createdAt: (_c = lesson.createdAt) === null || _c === void 0 ? void 0 : _c.toISOString(),
                    updatedAt: (_d = lesson.updatedAt) === null || _d === void 0 ? void 0 : _d.toISOString(),
                });
            });
            console.log(`getLessonsByCourseId - Lessons fetched:`, transformedLessons);
            return transformedLessons;
        });
    }
    updateLesson(lessonId, lessonData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`updateLesson - Updating lesson with ID: ${lessonId}`, lessonData);
            const result = yield lessonModel_1.lessonModel.updateOne({ _id: lessonId }, { $set: lessonData });
            if (result.matchedCount === 0) {
                console.log(`updateLesson - Lesson not found: ${lessonId}`);
                throw new Error('Lesson not found');
            }
            console.log(`updateLesson - Lesson updated successfully: ${lessonId}`);
        });
    }
    deleteLesson(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`deleteLesson - Deleting lesson with ID: ${lessonId}`);
            const result = yield lessonModel_1.lessonModel.deleteOne({ _id: lessonId });
            if (result.deletedCount === 0) {
                console.log(`deleteLesson - Lesson not found: ${lessonId}`);
                throw new Error('Lesson not found');
            }
            console.log(`deleteLesson - Lesson deleted successfully: ${lessonId}`);
        });
    }
}
exports.LessonRepository = LessonRepository;
