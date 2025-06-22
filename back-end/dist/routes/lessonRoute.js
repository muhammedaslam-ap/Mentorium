"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LessonRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const S3_uploader_1 = require("../middlewares/S3.uploader");
const lessonInjection_1 = require("../di/lessonInjection");
class LessonRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/courses/:courseId/lessons', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, S3_uploader_1.lessonVideoUploadMiddleware, (req, res) => lessonInjection_1.lessonController.addLesson(req, res));
        this.router.get('/lessons/:lessonId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor', 'student']), checkUserBlocked_1.checkUserBlocked, (req, res) => lessonInjection_1.lessonController.getLesson(req, res));
        // Get lessons by course ID
        this.router.get('/courses/:courseId/lessons', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor', 'student']), checkUserBlocked_1.checkUserBlocked, (req, res) => lessonInjection_1.lessonController.getLessonsByCourse(req, res));
        // Update lesson
        this.router.put('/lessons/:lessonId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, S3_uploader_1.lessonVideoUploadMiddleware, (req, res) => lessonInjection_1.lessonController.updateLesson(req, res));
        // Delete lesson
        this.router.delete('/lessons/:lessonId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => lessonInjection_1.lessonController.deleteLesson(req, res));
    }
}
exports.LessonRoutes = LessonRoutes;
exports.default = new LessonRoutes().router;
