"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WalletRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const walletInjection_1 = require("../di/walletInjection");
class WalletRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.get('/wallet', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => walletInjection_1.injectedWalletController.getWallet(req, res));
    }
}
exports.WalletRoutes = WalletRoutes;
exports.default = new WalletRoutes().router;
