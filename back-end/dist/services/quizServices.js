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
exports.quizService = void 0;
class quizService {
    constructor(quizRepository) {
        this.quizRepository = quizRepository;
    }
    addQuiz(tutorId, quizData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tutorId)
                throw new Error('Tutor ID is required');
            if (!quizData)
                throw new Error('Quiz data is required');
            return yield this.quizRepository.createquiz(quizData);
        });
    }
    deleteQuiz(tutorId, quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tutorId || !quizId)
                throw new Error('Tutor ID and quiz ID are required');
            yield this.quizRepository.deletequiz(quizId);
        });
    }
    getQuizById(quizId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!quizId)
                throw new Error('Quiz ID is required');
            return yield this.quizRepository.getquizById(quizId);
        });
    }
    getQuizByLessonId(courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!courseId)
                throw new Error('Course ID is required');
            return yield this.quizRepository.getquizsByLessonId(courseId);
        });
    }
    updateQuiz(tutorId, quizId, quizData) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!tutorId || !quizId)
                throw new Error('Tutor ID and quiz ID are required');
            yield this.quizRepository.updatequiz(quizId, quizData);
            const updated = yield this.quizRepository.getquizById(quizId);
            if (!updated)
                throw new Error('Quiz not found after update');
            return updated;
        });
    }
}
exports.quizService = quizService;
