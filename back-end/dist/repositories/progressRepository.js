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
exports.ProgressRepository = void 0;
const prograssModel_1 = require("../models/prograssModel");
class ProgressRepository {
    markLessonCompleted(userId, courseId, lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const existingProgress = yield prograssModel_1.progressModel.findOne({
                    userId,
                    courseId,
                    lessonId,
                });
                if (existingProgress) {
                    return;
                }
                yield prograssModel_1.progressModel.create({
                    userId,
                    courseId,
                    lessonId,
                    completedAt: new Date(),
                });
            }
            catch (error) {
                console.error("Error marking lesson as completed:", error);
                throw new Error("Failed to mark lesson as completed");
            }
        });
    }
    getCompletedLessons(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const progressRecords = yield prograssModel_1.progressModel
                    .find({ userId, courseId })
                    .select("lessonId")
                    .lean();
                return progressRecords.map((record) => record.lessonId.toString());
            }
            catch (error) {
                console.error("Error fetching completed lessons:", error);
                throw new Error("Failed to fetch completed lessons");
            }
        });
    }
}
exports.ProgressRepository = ProgressRepository;
