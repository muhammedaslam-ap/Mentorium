"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CallHistoryRoute = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const callHistoryController_1 = require("../controller/callHistoryController");
class CallHistoryRoute {
    constructor() {
        this.callHistoryController = new callHistoryController_1.CallHistoryController;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/call-history', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor', 'student']), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log("hellow here blaalablaa");
            this.callHistoryController.getCallHistory(req, res);
        });
    }
}
exports.CallHistoryRoute = CallHistoryRoute;
exports.default = new CallHistoryRoute().router;
