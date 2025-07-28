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
exports.AuthController = void 0;
const constant_1 = require("../shared/constant");
const custom_error_1 = require("../utils/custom.error");
const cookieHelper_1 = require("../utils/cookieHelper");
class AuthController {
    constructor(_authService, _jwtService) {
        this._authService = _authService;
        this._jwtService = _jwtService;
    }
    registerUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let data = req.body;
                if (data.role == "tutor") {
                    data = Object.assign(Object.assign({}, data), { isAccepted: false });
                }
                const user = yield this._authService.registerUser(data);
                console.log("new user here", user);
                res.status(constant_1.HTTP_STATUS.CREATED).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
                    tutorId: user._id
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
    loginUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const { user, accessToken, refreshToken } = yield this._authService.loginUser(data);
                console.warn("redux data", user);
                (0, cookieHelper_1.setAuthCookies)(res, accessToken, refreshToken, `${data.role}AccessToken`, `${data.role}RefreshToken`);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    message: constant_1.SUCCESS_MESSAGES.LOGIN_SUCCESS,
                    user: { id: user._id, username: user.name, role: user.role, isAccepted: user.isAccepted },
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res.status(constant_1.HTTP_STATUS.FORBIDDEN).json({ success: false, message: constant_1.ERROR_MESSAGES.FORBIDDEN });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    logoutUser(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                res.clearCookie("studentAccessToken");
                res.clearCookie("tutorAccessToken")
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
    forgotPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email } = req.body;
                yield this._authService.forgotPassword(email);
                res.status(constant_1.HTTP_STATUS.OK).json({ message: "OTP sent successfully" });
            }
            catch (error) {
                console.log(error);
                res.status(error.status || 500).json({ message: error.message });
            }
        });
    }
    verifyOtp(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const { email, otp } = req.body;
                const isValid = yield this._authService.verifyResetOtp({
                    email,
                    otp: Number(otp),
                });
                if (!isValid) {
                    return res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: "Invalid or expired OTP" });
                }
                res.status(constant_1.HTTP_STATUS.OK).json({ message: "OTP verified successfully" });
            }
            catch (error) {
                res.status(error.status || 500).json({ message: error.message });
            }
        });
    }
    resetPassword(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = req.body;
                const updated = yield this._authService.resetPassword(data);
                if (!updated) {
                    return res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ message: "Failed to reset password" });
                }
                res.status(constant_1.HTTP_STATUS.OK).json({ message: "Password reset successfully" });
            }
            catch (error) {
                res.status(error.status || 500).json({ message: error.message });
            }
        });
    }
    findUserById(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const userId = req.params.userId;
                console.log("hhh", userId);
                if (!userId) {
                    return res.status(400).json({ message: "userId is required in route params" });
                }
                const userData = yield this._authService.findByIdWithProfile(userId);
                console.log("✅ User data fetched:", userData);
                res.status(200).json({ message: "Data retrieved", userData });
            }
            catch (error) {
                res.status(error.status || 500).json({ message: error.message });
            }
        });
    }
}
exports.AuthController = AuthController;
