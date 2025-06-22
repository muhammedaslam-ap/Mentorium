"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.WishlistReposiotry = void 0;
const course_1 = require("../models/course");
const wishlistModel_1 = require("../models/wishlistModel");
class WishlistReposiotry {
    addToWishlist(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            let wishlist = yield wishlistModel_1.wishlistModel.findOne({ userId });
            if (wishlist) {
                const courseExists = wishlist.wishlist.some((item) => item.courseId.toString() === courseId.toString());
                if (courseExists) {
                    return true;
                }
                wishlist.wishlist.push({
                    courseId,
                    addedAt: new Date(),
                });
                yield wishlist.save();
                return false;
            }
            else {
                wishlist = yield wishlistModel_1.wishlistModel.create({
                    userId,
                    wishlist: [{ courseId, addedAt: new Date() }],
                });
                return false;
            }
        });
    }
    getWishlisted(userId, page, limit) {
        return __awaiter(this, void 0, void 0, function* () {
            const whishlist = yield wishlistModel_1.wishlistModel.findOne({ userId });
            console.log(whishlist);
            if (!whishlist) {
                return [];
            }
            const courseId = whishlist.wishlist.map((item) => item.courseId);
            const courses = yield course_1.courseModel
                .find({ _id: { $in: courseId } })
                .skip((page - 1) * limit)
                .limit(limit);
            return courses;
        });
    }
    removeWishlist(userId, courseId) {
        return __awaiter(this, void 0, void 0, function* () {
            const wishlist = yield wishlistModel_1.wishlistModel.findOne({ userId });
            if (!wishlist) {
                return;
            }
            wishlist.wishlist.pull({ courseId });
            if (wishlist.wishlist.length === 0) {
                yield wishlistModel_1.wishlistModel.deleteOne({ userId });
            }
            else {
                yield wishlist.save();
            }
        });
    }
}
exports.WishlistReposiotry = WishlistReposiotry;
