"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AdminRoutes = void 0;
const express_1 = require("express");
const adminAuthMiddleware_1 = require("../middlewares/adminAuthMiddleware");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const adminInjection_1 = require("../di/adminInjection");
class AdminRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.router = (0, express_1.Router)();
        this.initializeRoute();
    }
    initializeRoute() {
        this.router.get("/usersList", adminAuthMiddleware_1.adminAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['admin']), (req, res) => adminInjection_1.injectedAdminController.usersList(req, res));
        this.router.patch("/:tutorId/approve", adminAuthMiddleware_1.adminAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["admin"]), (req, res) => adminInjection_1.injectedAdminController.acceptTutor(req, res));
        this.router.patch("/:tutorId/reject", adminAuthMiddleware_1.adminAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["admin"]), (req, res) => adminInjection_1.injectedAdminController.rejectTutor(req, res));
        this.router.patch("/:id/status", adminAuthMiddleware_1.adminAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["admin"]), (req, res) => adminInjection_1.injectedAdminController.updateStatus(req, res));
        // Logout
        this.router.post("/logout", adminAuthMiddleware_1.adminAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["admin"]), (req, res) => adminInjection_1.injectedAdminController.logoutAdmin(req, res));
    }
}
exports.AdminRoutes = AdminRoutes;
exports.default = new AdminRoutes().router;
