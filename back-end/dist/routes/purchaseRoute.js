"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PurchaseRoute = void 0;
const express_1 = require("express");
const purchaseInjection_1 = require("../di/purchaseInjection");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
class PurchaseRoute {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/saveOrder", userAuthMiddleware_1.userAuthMiddleware, checkUserBlocked_1.checkUserBlocked, (0, userAuthMiddleware_1.authorizeRole)(["student"]), (req, res) => {
            purchaseInjection_1.injectedBuyCourseController.saveOrder(req, res);
        });
        this.router.get("/enrolledCourses", userAuthMiddleware_1.userAuthMiddleware, checkUserBlocked_1.checkUserBlocked, (0, userAuthMiddleware_1.authorizeRole)(["student"]), (req, res) => {
            console.log("Reached /enrolledCourses handler");
            purchaseInjection_1.injectedBuyCourseController.getEnrolledCourses(req, res);
        });
        this.router.get("/Purchase-history", userAuthMiddleware_1.userAuthMiddleware, checkUserBlocked_1.checkUserBlocked, (0, userAuthMiddleware_1.authorizeRole)(["student"]), (req, res) => {
            purchaseInjection_1.injectedBuyCourseController.myPurchaseHistory(req, res);
        });
        this.router.get("/enrollments/:courseId", userAuthMiddleware_1.userAuthMiddleware, (req, res) => {
            purchaseInjection_1.injectedBuyCourseController.checkEnrollment(req, res);
        });
    }
}
exports.PurchaseRoute = PurchaseRoute;
exports.default = new PurchaseRoute().router;
