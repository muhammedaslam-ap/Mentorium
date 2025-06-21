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
exports.WishlistController = void 0;
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
const cloudinaryURL_1 = require("../utils/cloudinaryURL");
class WishlistController {
    constructor(_wishlistService) {
        this._wishlistService = _wishlistService;
    }
    addToWishlist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { courseId } = req.params;
                const exist = yield this._wishlistService.addToWishlist(user === null || user === void 0 ? void 0 : user.id, courseId);
                if (exist) {
                    res.status(constant_1.HTTP_STATUS.CONFLICT).json({
                        success: true,
                        message: constant_1.SUCCESS_MESSAGES.ALREADY_WISHLIST,
                    });
                    return;
                }
                res.status(constant_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.ADDED_WHISHLIST,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res
                        .status(error.statusCode)
                        .json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getWishlisted(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { page, limit } = req.query;
                const courses = yield this._wishlistService.getWishlisted(user === null || user === void 0 ? void 0 : user.id, Number(page), Number(limit));
                const updatedCourses = courses
                    ? yield Promise.all(courses.map((course) => __awaiter(this, void 0, void 0, function* () {
                        if (course.thumbnail) {
                            console.log("COURSE THUMBNAIL", course.thumbnail);
                            course.thumbnail = yield (0, cloudinaryURL_1.createSecureUrl)(course.thumbnail, 'image');
                        }
                        return course;
                    })))
                    : [];
                console.log("jjjjjjjjjjjj", updatedCourses);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    courses: updatedCourses
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res
                        .status(error.statusCode)
                        .json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    removeWishlist(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { courseId } = req.params;
                yield this._wishlistService.removeWishlist(user === null || user === void 0 ? void 0 : user.id, courseId);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.REMOVED_WHISHLIST,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res
                        .status(error.statusCode)
                        .json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
}
exports.WishlistController = WishlistController;
