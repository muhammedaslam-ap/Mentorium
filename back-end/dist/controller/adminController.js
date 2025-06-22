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
exports.AdminController = void 0;
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
class AdminController {
    constructor(_adminService) {
        this._adminService = _adminService;
    }
    logoutAdmin(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res
                    .clearCookie("adminAccessToken", {
                    httpOnly: true,
                    secure: false,
                    sameSite: "lax",
                })
                    .status(200)
                    .json({ message: "Logout successful" });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ error: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    acceptTutor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tutorId } = req.params;
                if (!tutorId) {
                    res
                        .status(constant_1.HTTP_STATUS.BAD_REQUEST)
                        .json({ success: false, message: constant_1.ERROR_MESSAGES.ID_NOT_PROVIDED });
                    return;
                }
                yield this._adminService.acceptTutor(tutorId);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
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
    rejectTutor(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { tutorId } = req.params;
                const { reason } = req.body;
                console.log(`ID:${tutorId} , reason:${reason}`);
                yield this._adminService.updateRejectedReason(tutorId.toString(), reason);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
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
    usersList(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const page = parseInt(req.query.page) || 1;
                const pageSize = parseInt(req.query.limit) || 10;
                const search = req.query.search;
                const role = req.query.role;
                const result = yield this._adminService.usersList({
                    page,
                    pageSize,
                    search,
                    role,
                });
                res.status(200).json(result);
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
    updateStatus(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { id } = req.params;
                const { status } = req.body;
                yield this._adminService.updateStatus(id, status);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    message: constant_1.SUCCESS_MESSAGES.UPDATE_SUCCESS,
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
exports.AdminController = AdminController;
