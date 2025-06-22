"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const adminAuthMiddleware_1 = require("../middlewares/adminAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const transactionInjection_1 = require("../di/transactionInjection");
class TransactionRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get("/transaction-details", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["tutor", "admin"]), checkUserBlocked_1.checkUserBlocked, (req, res) => transactionInjection_1.injectedTransactionController.transactionDetails(req, res));
        this.router.get("/dashBoard", adminAuthMiddleware_1.adminAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["admin"]), (req, res) => {
            console.log("hyhyhyhy12345");
            transactionInjection_1.injectedTransactionController.getDashboard(req, res);
        });
        this.router.get("/admin-wallet-details", adminAuthMiddleware_1.adminAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["admin"]), (req, res) => transactionInjection_1.injectedTransactionController.getAdminWalletData(req, res));
    }
}
exports.TransactionRoutes = TransactionRoutes;
exports.default = new TransactionRoutes().router;
