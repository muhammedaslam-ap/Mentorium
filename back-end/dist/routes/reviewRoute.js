"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReviewRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const reviewInjection_1 = require("../di/reviewInjection");
class ReviewRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/:courseId/add", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            reviewInjection_1.injectedReviewController.addReview(req, res);
        });
        this.router.get("/:courseId", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student", "tutor"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            reviewInjection_1.injectedReviewController.getReviewsByCourse(req, res);
        });
    }
}
exports.ReviewRoutes = ReviewRoutes;
exports.default = new ReviewRoutes().router;
