"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TutorRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const S3_uploader_1 = require("../middlewares/S3.uploader");
const tutorInjection_1 = require("../di/tutorInjection");
class TutorRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/profile', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, S3_uploader_1.verificationUploadMiddleware, (req, res) => tutorInjection_1.injectedTutorController.addTutorProfile(req, res));
        this.router.get('/profile', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => tutorInjection_1.injectedTutorController.getTutorProfile(req, res));
        this.router.get("/notifications", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor", "student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("Fetching notifications 3");
            tutorInjection_1.injectedTutorController.getNotification(req, res);
        });
        this.router.put("/notifications/read-all", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor", "student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("notificaiton 1");
            tutorInjection_1.injectedTutorController.markAllNotificationsAsRead(req, res);
        });
        this.router.put("/notifications/:id/read", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor", "student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("notificaiton 2");
            tutorInjection_1.injectedTutorController.markNotificationAsRead(req, res);
        });
        this.router.put('/editProfile', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, S3_uploader_1.verificationUploadMiddleware, (req, res) => tutorInjection_1.injectedTutorController.updateTutorProfile(req, res));
        this.router.get("/students", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor", "student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => tutorInjection_1.injectedTutorController.getEnrolledStudent(req, res));
        this.router.get("/tutor/:tutorId", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor", "student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => tutorInjection_1.injectedTutorController.tutorProfile(req, res));
        this.router.get('/document', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => tutorInjection_1.injectedTutorController.getDocumentPresignedUrl(req, res));
    }
}
exports.TutorRoutes = TutorRoutes;
exports.default = new TutorRoutes().router;
