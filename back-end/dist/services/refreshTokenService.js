"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RefreshTokenService = void 0;
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
class RefreshTokenService {
    constructor(_tokenService) {
        this._tokenService = _tokenService;
    }
    execute(refreshToken) {
        console.log('refresh token inside refrsh tokcen service', refreshToken);
        const payload = this._tokenService.verifyRefreshtoken(refreshToken);
        if (!payload)
            throw new custom_error_1.CustomError("Invalid refresh token", constant_1.HTTP_STATUS.BAD_REQUEST);
        return {
            role: payload.role,
            accessToken: this._tokenService.generateAccessToken({
                id: payload.id,
                email: payload.email,
                role: payload.role,
            }),
        };
    }
}
exports.RefreshTokenService = RefreshTokenService;
