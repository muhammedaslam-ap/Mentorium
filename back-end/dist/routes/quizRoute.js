"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QuizRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const quizInjection_1 = require("../di/quizInjection");
class QuizRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/lesson/:lessonId/quiz', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => quizInjection_1.injectedQuizController.addQuiz(req, res));
        this.router.get('/lesson/:quizId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor', 'student']), checkUserBlocked_1.checkUserBlocked, (req, res) => quizInjection_1.injectedQuizController.getQuiz(req, res));
        this.router.get('/lesson/:lessonId/quizId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor', 'student']), checkUserBlocked_1.checkUserBlocked, (req, res) => quizInjection_1.injectedQuizController.getQuizByLesson(req, res));
        this.router.put('/quiz/:quizId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => quizInjection_1.injectedQuizController.updateQuiz(req, res));
        this.router.delete('/quiz/:quizId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => quizInjection_1.injectedQuizController.deleteQuiz(req, res));
    }
}
exports.QuizRoutes = QuizRoutes;
exports.default = new QuizRoutes().router;
