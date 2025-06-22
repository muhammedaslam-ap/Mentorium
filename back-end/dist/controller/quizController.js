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
exports.QuizController = void 0;
const constant_1 = require("../shared/constant");
class QuizController {
    constructor(quizService) {
        this.quizService = quizService;
    }
    addQuiz(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const { question, answer, lesson_id, options } = req.body;
                console.log('addQuiz - Request body:', { question, answer, lesson_id, options });
                if (!tutorId) {
                    console.error('addQuiz - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                if (!lesson_id) {
                    console.error('addQuiz - Missing required field lesson_id');
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.INCOMPLETE_INFO });
                    return;
                }
                if (!question || !answer || !options) {
                    console.error('addQuiz - Missing required fields');
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: constant_1.ERROR_MESSAGES.INCOMPLETE_INFO });
                    return;
                }
                const quizData = {
                    answer,
                    lesson_id,
                    options,
                    question,
                };
                const quiz = yield this.quizService.addQuiz(tutorId, quizData);
                console.log(`Quiz added for lesson: ${lesson_id}`);
                res.status(constant_1.HTTP_STATUS.CREATED).json({ message: constant_1.SUCCESS_MESSAGES.CREATED, quiz });
            }
            catch (error) {
                console.error('Error adding quiz:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getQuiz(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const quizId = req.params.quizId;
                console.log(`getQuiz - Fetching quiz with ID: ${quizId}`);
                const quiz = yield this.quizService.getQuizById(quizId);
                if (!quiz) {
                    console.log(`Quiz not found: ${quizId}`);
                    res.status(constant_1.HTTP_STATUS.NOT_FOUND).json({ message: constant_1.ERROR_MESSAGES.USER_NOT_FOUND });
                    return;
                }
                console.log(`Quiz fetched:`, quiz);
                res.status(constant_1.HTTP_STATUS.OK).json({ quiz, message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
            }
            catch (error) {
                console.error('Error fetching quiz:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getQuizByLesson(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const lessonId = req.params.lessonId;
                console.log(`getQuizByLesson - Fetching quiz for lessonId: ${lessonId}`);
                const quiz = yield this.quizService.getQuizByLessonId(lessonId);
                console.log(`Quiz fetched for lessonId: ${lessonId}`, quiz);
                res.status(constant_1.HTTP_STATUS.OK).json({ quiz, message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
            }
            catch (error) {
                console.error('Error fetching quiz:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    updateQuiz(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const quizId = req.params.quizId;
                const { answer, lesson_id, options, question } = req.body;
                console.log('updateQuiz - Request body:', { answer, lesson_id, options, question });
                if (!tutorId) {
                    console.error('updateQuiz - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                const quizData = {
                    answer,
                    lesson_id,
                    options,
                    question,
                };
                const quiz = yield this.quizService.updateQuiz(tutorId, quizId, quizData);
                console.log(`Quiz updated: ${quizId}`);
                res.status(constant_1.HTTP_STATUS.OK).json({ message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS, quiz });
            }
            catch (error) {
                console.error('Error updating quiz:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    deleteQuiz(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const tutorId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                const quizId = req.params.quizId;
                console.log(`deleteQuiz - Deleting quiz with ID: ${quizId}`);
                if (!tutorId) {
                    console.error('deleteQuiz - No tutor ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                yield this.quizService.deleteQuiz(tutorId, quizId);
                console.log(`Quiz deleted: ${quizId}`);
                res.status(constant_1.HTTP_STATUS.OK).json({ message: constant_1.SUCCESS_MESSAGES.DELETE_SUCCESS });
            }
            catch (error) {
                console.error('Error deleting quiz:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
}
exports.QuizController = QuizController;
