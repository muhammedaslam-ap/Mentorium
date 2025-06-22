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
exports.decodeToken = exports.adminAuthMiddleware = void 0;
const jwt_1 = require("../services/jwt/jwt");
const constant_1 = require("../shared/constant");
const custom_error_1 = require("../utils/custom.error");
const tokenService = new jwt_1.JwtService();
const adminAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies.adminAccessToken;
        console.log("---------------------", req.cookies.adminAccessToken);
        if (!token) {
            console.log("no token");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
            return;
        }
        const user = tokenService.verifyAccessToken(token);
        if (!user || !user.id) {
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
            return;
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof custom_error_1.CustomError) {
            if (error.name === "TokenExpiredError") {
                console.log("token is expired is worked");
                res
                    .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                    .json({ message: constant_1.ERROR_MESSAGES.TOKEN_EXPIRED });
                return;
            }
            console.log("token is invalid is worked");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.INVALID_TOKEN });
            return;
        }
    }
});
exports.adminAuthMiddleware = adminAuthMiddleware;
const decodeToken = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.cookies["adminAccessToken"];
        if (!token) {
            console.log("no token");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
            return;
        }
        const user = tokenService.decodeAccessToken(token === null || token === void 0 ? void 0 : token.access_token);
        console.log("decoded", user);
        req.user = {
            id: user === null || user === void 0 ? void 0 : user.id,
            email: user === null || user === void 0 ? void 0 : user.email,
            role: user === null || user === void 0 ? void 0 : user.role,
            access_token: token.access_token,
            refresh_token: token.refresh_token,
        };
        next();
    }
    catch (error) {
        console.error(error);
    }
});
exports.decodeToken = decodeToken;
