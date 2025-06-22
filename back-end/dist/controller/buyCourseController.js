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
exports.PurchaseController = void 0;
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
const cloudinaryURL_1 = require("../utils/cloudinaryURL");
class PurchaseController {
    constructor(_purchaseService) {
        this._purchaseService = _purchaseService;
    }
    saveOrder(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const data = req.body;
                console.log("DATA IN BACKEND", data);
                yield this._purchaseService.saveOrder(user.id, data);
                res.status(constant_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.CREATED,
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
    checkEnrollment(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                console.log("here im------>", user);
                if (!(user === null || user === void 0 ? void 0 : user.id)) {
                    throw new Error(constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
                }
                const { courseId } = req.params;
                if (!courseId) {
                    throw new Error(constant_1.ERROR_MESSAGES.MISSING_PARAMETERS);
                }
                const isEnrolled = yield this._purchaseService.checkEnrollment(user.id, courseId);
                console.log("finallyyyyyyy", isEnrolled);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: isEnrolled ? "User is enrolled in the course" : "User is not enrolled in the course",
                    data: { isEnrolled },
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ success: false, message: error.message });
                    return;
                }
                console.error("Error in checkEnrollment:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
    getEnrolledCourses(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const result = yield this._purchaseService.getUserEnrolledCourses(user.id);
                const defaultThumbnail = "/uploads/default.jpg";
                const updatedCourses = result.courses
                    ? yield Promise.all(result.courses.map((course) => __awaiter(this, void 0, void 0, function* () {
                        try {
                            const thumbnail = course.thumbnail || defaultThumbnail;
                            console.log(`Processing thumbnail for course ${course._id}: ${thumbnail}`);
                            const secureUrl = yield (0, cloudinaryURL_1.createSecureUrl)(thumbnail, "image");
                            return Object.assign(Object.assign({}, course), { thumbnail: secureUrl || defaultThumbnail });
                        }
                        catch (error) {
                            console.error(`Error creating secure URL for course ${course._id}: ${error.message}`);
                            return Object.assign(Object.assign({}, course), { thumbnail: defaultThumbnail });
                        }
                    })))
                    : [];
                console.log("Updated courses with secure URLs:", JSON.stringify(updatedCourses, null, 2));
                res.status(constant_1.HTTP_STATUS.OK).json({ courses: updatedCourses, total: result.total });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ success: false, message: error.message });
                    return;
                }
                console.error("Error getting enrolled courses:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
    myPurchaseHistory(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                if (!userId) {
                    return res.status(401).json({ success: false, message: "Unauthorized" });
                }
                const history = yield this._purchaseService.getPurchaseHistory(userId);
                console.log('haro haro hara', history);
                res.status(200).json({
                    success: true,
                    message: "Purchase history retrieved",
                    history
                });
            }
            catch (error) {
                console.error("Purchase history error:", error);
                res.status(500).json({ success: false, message: "Server error" });
            }
        });
    }
}
exports.PurchaseController = PurchaseController;
