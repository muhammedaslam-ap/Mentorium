"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ProgressRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const progressInjection_1 = require("../di/progressInjection");
class ProgressRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/:lessonId/complete", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("hello imhereerererere");
            progressInjection_1.injectedProgressController.markLessonCompleted(req, res);
        });
        this.router.get("/:courseId/completed-lessons", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => progressInjection_1.injectedProgressController.getCompletedLessons(req, res));
    }
}
exports.ProgressRoutes = ProgressRoutes;
exports.default = new ProgressRoutes().router;
