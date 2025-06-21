"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectedWishlistController = void 0;
const wishlistController_1 = require("../controller/wishlistController");
const wishlistRepository_1 = require("../repositories/wishlistRepository");
const wishlistServices_1 = require("../services/wishlistServices");
const wishlistReposiotry = new wishlistRepository_1.WishlistReposiotry();
const wishlistService = new wishlistServices_1.WishlistService(wishlistReposiotry);
exports.injectedWishlistController = new wishlistController_1.WishlistController(wishlistService);
