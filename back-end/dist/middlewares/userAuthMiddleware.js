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
exports.authorizeRole = exports.userAuthMiddleware = void 0;
const jwt_1 = require("../services/jwt/jwt");
const constant_1 = require("../shared/constant");
const tokenService = new jwt_1.JwtService();
const userAuthMiddleware = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    var _a, _b;
    try {
        const token = (_b = (_a = req.cookies.tutorAccessToken) !== null && _a !== void 0 ? _a : req.cookies.studentAccessToken) !== null && _b !== void 0 ? _b : req.cookies.adminAccessToken;
        console.log("userAuthMiddleware - Token:", token);
        console.log("userAuthMiddleware - Request URL:", req.originalUrl);
        if (!token) {
            console.log("userAuthMiddleware - No token provided");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
        }
        const user = tokenService.verifyAccessToken(token);
        if (!user) {
            console.log("userAuthMiddleware - Invalid user data");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.INVALID_TOKEN });
        }
        req.user = user;
        next();
    }
    catch (error) {
        if (error instanceof Error && error.name === "TokenExpiredError") {
            console.log("userAuthMiddleware - Token expired");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.TOKEN_EXPIRED });
        }
        console.error("userAuthMiddleware - Invalid token:", error);
        res
            .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
            .json({ message: constant_1.ERROR_MESSAGES.INVALID_TOKEN });
    }
});
exports.userAuthMiddleware = userAuthMiddleware;
const authorizeRole = (allowedRoles) => {
    return (req, res, next) => {
        const user = req.user;
        console.log('role', user.role);
        console.log("authorizeRole - Request URL:", req.originalUrl); // Debug
        console.log("authorizeRole - User:", user); // Debug
        if (!user) {
            console.log("authorizeRole - No user found");
            res.status(constant_1.HTTP_STATUS.FORBIDDEN).json({
                message: constant_1.ERROR_MESSAGES.NOT_ALLOWED,
                userRole: "None",
            });
            return;
        }
        const userRole = user.role.toLowerCase();
        const allowedRolesLower = allowedRoles.map((role) => role.toLowerCase());
        if (!allowedRolesLower.includes(userRole)) {
            console.log(`authorizeRole - Access denied. Role: ${userRole}, Required: ${allowedRolesLower}`);
            res.status(constant_1.HTTP_STATUS.FORBIDDEN).json({
                message: constant_1.ERROR_MESSAGES.NOT_ALLOWED,
                userRole: user.role,
            });
            return;
        }
        console.log("authorizeRole - Access granted");
        next();
    };
};
exports.authorizeRole = authorizeRole;
