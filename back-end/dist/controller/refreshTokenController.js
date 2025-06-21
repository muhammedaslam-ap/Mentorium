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
            var _a, _b;
            try {
                const token = req.cookies.studentRefreshToken ||
                    req.cookies.adminRefreshToken ||
                    req.cookies.tutorRefreshToken;
                console.log('inside refresh token controller======>', req.cookies);
                const newTokens = this._refreshTokenService.execute(token);
                const accessTokenName = `${newTokens.role}AccessToken`;
                (0, cookieHelper_1.updateCookieWithAccessToken)(res, newTokens.accessToken, accessTokenName);
                res
                    .status(constant_1.HTTP_STATUS.OK)
                    .json({ success: true, message: constant_1.SUCCESS_MESSAGES.OPERATION_SUCCESS });
            }
            catch (error) {
                (0, cookieHelper_1.clearAuthCookies)(res, `${(_a = req.user) === null || _a === void 0 ? void 0 : _a.role}AccessToken`, `${(_b = req.user) === null || _b === void 0 ? void 0 : _b.role}RefreshToken`);
                res
                    .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                    .json({ message: constant_1.ERROR_MESSAGES.INVALID_TOKEN });
                console.error(error);
            }
        });
    }
}
exports.RefreshTokenController = RefreshTokenController;
