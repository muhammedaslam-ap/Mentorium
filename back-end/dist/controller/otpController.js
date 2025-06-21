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
exports.OtpController = void 0;
const constant_1 = require("../shared/constant");
const custom_error_1 = require("../utils/custom.error");
class OtpController {
    constructor(_otpService) {
        this._otpService = _otpService;
    }
    otpGenerate(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                yield this._otpService.checkExistingUser(data.email);
                yield this._otpService.otpGenerate(data);
                res.status(constant_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.OTP_SEND_SUCCESS,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({
                        success: false,
                        message: error.message,
                    });
                    return;
                }
                console.error("[OtpController Error]:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
    verifyOtpToRegister(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                console.log("datttaaaa", data.email);
                yield this._otpService.verifyOtp(data);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.VERIFICATION_SUCCESS,
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
exports.OtpController = OtpController;
