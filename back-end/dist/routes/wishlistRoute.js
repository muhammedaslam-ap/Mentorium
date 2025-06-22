"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const wishlistInjection_1 = require("../di/wishlistInjection");
class WishlistRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/:courseId", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => wishlistInjection_1.injectedWishlistController.addToWishlist(req, res));
        this.router.get("/", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            console.log('heheheh');
            wishlistInjection_1.injectedWishlistController.getWishlisted(req, res);
        });
        this.router.delete("/:courseId", userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(["student"]), checkUserBlocked_1.checkUserBlocked, (req, res) => wishlistInjection_1.injectedWishlistController.removeWishlist(req, res));
    }
}
exports.WishlistRoutes = WishlistRoutes;
exports.default = new WishlistRoutes().router;
