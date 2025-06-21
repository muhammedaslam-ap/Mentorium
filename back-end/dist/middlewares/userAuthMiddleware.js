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
        // Check Authorization header first, then cookies
        console.log("rererer", req.cookies);
        let token = ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith("Bearer "))
            ? req.headers.authorization.split(" ")[1]
            : (_b = req.cookies.studentAccessToken) !== null && _b !== void 0 ? _b : req.cookies.tutorAccessToken;
        console.log("userAuthMiddleware - Token:", token); // Debug
        console.log("userAuthMiddleware - Request URL:", req.originalUrl); // Debug
        if (!token) {
            console.log("userAuthMiddleware - No token provided");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
            return;
        }
        const user = tokenService.verifyAccessToken(token);
        console.log("userAuthMiddleware - Decoded User:", user); // Debug
        if (!user) {
            console.log("userAuthMiddleware - Invalid user data");
            res
                .status(constant_1.HTTP_STATUS.UNAUTHORIZED)
                .json({ message: constant_1.ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
            return;
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
            return;
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
