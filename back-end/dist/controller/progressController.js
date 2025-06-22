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
exports.ProgressController = void 0;
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
class ProgressController {
    constructor(_progressService) {
        this._progressService = _progressService;
    }
    markLessonCompleted(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const user = req.user;
                const { lessonId } = req.params;
                const { courseId } = req.body;
                yield this._progressService.markLessonCompleted(user.id, courseId, lessonId);
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
    getCompletedLessons(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { courseId } = req.params;
                const user = req.user;
                const lessons = yield this._progressService.getCompletedLessons(user.id, courseId);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    lessons
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
exports.ProgressController = ProgressController;
