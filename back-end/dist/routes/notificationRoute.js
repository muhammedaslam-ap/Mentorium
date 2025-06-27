"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationRoute = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const notificationController_1 = require("../controller/notificationController");
class NotificationRoute {
    constructor() {
        this.callHistoryController = new notificationController_1.NotificationController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.delete('/clear/:userId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor', 'student']), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("hellow here blaalablaa");
            this.callHistoryController.deleteAllNotifications(req, res);
        });
    }
}
exports.NotificationRoute = NotificationRoute;
exports.default = new NotificationRoute().router;
