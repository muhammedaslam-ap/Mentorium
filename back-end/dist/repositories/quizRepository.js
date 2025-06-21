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
exports.quizRepository = void 0;
const quizModel_1 = require("../models/quizModel");
class quizRepository {
    createquiz(quizData) {
        return __awaiter(this, void 0, void 0, function* () {
            const created = yield quizModel_1.quizModel.create(quizData);
            return created.toObject();
        });
    }
    getquizById(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`getquizById - Fetching quiz with ID: ${quizId}`);
            const quiz = yield quizModel_1.quizModel.findById(quizId).lean().exec();
            if (!quiz) {
                console.log(`getquizById - quiz not found: ${quizId}`);
                return null;
            }
            const transformedquiz = {
                _id: quiz._id,
                lesson_id: quiz.lesson_id,
                question: quiz.question,
                options: quiz.options,
                answer: quiz.answer
            };
            console.log(`getquizById - quiz fetched:`, transformedquiz);
            return transformedquiz;
        });
    }
    getquizsByLessonId(lessonId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`getquizsByLessonId - Fetching quizzes for lessonId: ${lessonId}`);
            const quizzes = yield quizModel_1.quizModel
                .find({ lesson_id: lessonId })
                .sort({ createdAt: 1 })
                .lean()
                .exec();
            const transformedQuizzes = quizzes.map((quiz) => ({
                _id: quiz._id,
                lesson_id: quiz.lesson_id,
                question: quiz.question,
                options: quiz.options,
                answer: quiz.answer,
                createdAt: quiz.createdAt,
                updatedAt: quiz.updatedAt,
            }));
            console.log(`getquizsByLessonId - Quizzes fetched:`, transformedQuizzes);
            return transformedQuizzes;
        });
    }
    updatequiz(quizId, quizData) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`updatequiz - Updating quiz with ID: ${quizId}`, quizData);
            const result = yield quizModel_1.quizModel.updateOne({ _id: quizId }, { $set: quizData });
            if (result.matchedCount === 0) {
                console.log(`updatequiz - quiz not found: ${quizId}`);
                throw new Error('quiz not found');
            }
            console.log(`updatequiz - quiz updated successfully: ${quizId}`);
        });
    }
    deletequiz(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log(`deletequiz - Deleting quiz with ID: ${quizId}`);
            const result = yield quizModel_1.quizModel.deleteOne({ _id: quizId });
            if (result.deletedCount === 0) {
                console.log(`deletequiz - quiz not found: ${quizId}`);
                throw new Error('quiz not found');
            }
            console.log(`deletequiz - quiz deleted successfully: ${quizId}`);
        });
    }
}
exports.quizRepository = quizRepository;
