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
exports.ReviewController = void 0;
const constant_1 = require("../shared/constant");
const custom_error_1 = require("../utils/custom.error");
class ReviewController {
    constructor(_reviewService) {
        this._reviewService = _reviewService;
    }
    addReview(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { courseId, rating, comment } = req.body;
                console.log("IN CONTROLLER REVIEW ADDING", req.body);
                const data = yield this._reviewService.addReview({
                    course_id: courseId,
                    user_id: user.id,
                    rating,
                    comment,
                });
                res.status(constant_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.CREATED,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    return res.status(error.statusCode).json({ success: false, message: error.message });
                }
                console.error(error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
    getReviewsByCourse(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                const reviews = yield this._reviewService.getReviewsForCourse(courseId);
                console.log("Backend Review", reviews);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    reviews,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    return res.status(error.statusCode).json({ success: false, message: error.message });
                }
                console.error(error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
}
exports.ReviewController = ReviewController;
