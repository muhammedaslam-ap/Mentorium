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
exports.RefreshTokenController = void 0;
const constant_1 = require("../shared/constant");
const cookieHelper_1 = require("../utils/cookieHelper");
class RefreshTokenController {
    constructor(_refreshTokenService) {
        this._refreshTokenService = _refreshTokenService;
    }
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('inside refresh token controller ======>', req.cookies);
                const { studentRefreshToken, tutorRefreshToken, adminRefreshToken } = req.cookies;
                const refreshedRoles = [];
                // Student
                if (studentRefreshToken && !req.cookies.studentAccessToken) {
                    const studentPayload = this._refreshTokenService.verify(studentRefreshToken, "student");
                    if (studentPayload) {
                        const accessToken = this._refreshTokenService.generateAccessToken(studentPayload);
                        (0, cookieHelper_1.updateCookieWithAccessToken)(res, accessToken, "studentAccessToken");
                        refreshedRoles.push("student");
                    }
                }
                // Tutor
                if (tutorRefreshToken && !req.cookies.tutorAccessToken) {
                    const tutorPayload = this._refreshTokenService.verify(tutorRefreshToken, "tutor");
                    if (tutorPayload) {
                        const accessToken = this._refreshTokenService.generateAccessToken(tutorPayload);
                        (0, cookieHelper_1.updateCookieWithAccessToken)(res, accessToken, "tutorAccessToken");
                        refreshedRoles.push("tutor");
                    }
                }
                // Admin
                if (adminRefreshToken && !req.cookies.adminAccessToken) {
                    const adminPayload = this._refreshTokenService.verify(adminRefreshToken, "admin");
                    if (adminPayload) {
                        const accessToken = this._refreshTokenService.generateAccessToken(adminPayload);
                        (0, cookieHelper_1.updateCookieWithAccessToken)(res, accessToken, "adminAccessToken");
                        refreshedRoles.push("admin");
                    }
                }
                if (refreshedRoles.length > 0) {
                    res.status(constant_1.HTTP_STATUS.OK).json({
                        success: true,
                        message: "Access tokens refreshed",
                        refreshed: refreshedRoles,
                    });
                }
                else {
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({
                        success: false,
                        message: "No valid refresh token found or access tokens already exist",
                    });
                }
            }
            catch (error) {
                console.error("Refresh error:", error);
                (0, cookieHelper_1.clearAuthCookies)(res, "studentAccessToken", "studentRefreshToken");
                (0, cookieHelper_1.clearAuthCookies)(res, "tutorAccessToken", "tutorRefreshToken");
                (0, cookieHelper_1.clearAuthCookies)(res, "adminAccessToken", "adminRefreshToken");
                res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.INVALID_TOKEN,
                });
            }
        });
    }
}
exports.RefreshTokenController = RefreshTokenController;
