"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.JwtService = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
class JwtService {
    constructor() {
        this._accessSecret = process.env.JWT_SECRET;
        this._accessExpiresIn = process.env.JWT_ACCESS_EXPIRES || "";
        this._refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES || "";
    }
    generateAccessToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this._accessSecret, {
            expiresIn: this._accessExpiresIn,
        });
    }
    generateRefreshToken(payload) {
        return jsonwebtoken_1.default.sign(payload, this._accessSecret, {
            expiresIn: this._refreshExpiresIn,
        });
    }
    verifyAccessToken(token) {
        try {
            //   console.log("Inside verify", this.accessSecret);
            //  console.log("TOKEN:",token);
            return jsonwebtoken_1.default.verify(token, this._accessSecret);
        }
        catch (error) {
            console.error("Access token verification failed:", error);
            return null;
        }
    }
    verifyRefreshtoken(token) {
        try {
            console.log("TOKEN INN REFRESHTOKEN", token);
            return jsonwebtoken_1.default.verify(token, this._accessSecret);
        }
        catch (error) {
            console.error("Refresh token verification failed:", error);
            return null;
        }
    }
    decodeAccessToken(token) {
        try {
            console.log('token inside the decode token in the toen service', token);
            return jsonwebtoken_1.default.decode(token);
        }
        catch (error) {
            console.error("Refresh token verification failed:", error);
            return null;
        }
    }
}
exports.JwtService = JwtService;
