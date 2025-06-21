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
exports.Controller = void 0;
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
const google_auth_library_1 = require("google-auth-library");
const cookieHelper_1 = require("../utils/cookieHelper");
class Controller {
    constructor(_Service, _jwtService) {
        this._Service = _Service;
        this._jwtService = _jwtService;
    }
    handle(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                console.log('Received request body:', req.body);
                const { credentialResponse, role } = req.body;
                const { credential, clientId } = credentialResponse;
                console.log('Received credential:', credential);
                console.log('Received clientId:', clientId);
                const client = new google_auth_library_1.OAuth2Client();
                const ticket = yield client.verifyIdToken({
                    idToken: credential,
                    audience: clientId,
                });
                const payload = ticket.getPayload();
                console.log('Token payload:', payload);
                if (!payload || !payload.email || !payload.given_name) {
                    throw new Error("Invalid token payload");
                }
                const existingUser = yield this._Service.findByEmail(payload.email);
                console.log('Existing User:', existingUser);
                console.log('Role mismatch:', role);
                if (!existingUser) {
                    console.log('No user found with this email:', payload.email);
                }
                else if (existingUser.role !== role) {
                    throw new custom_error_1.CustomError(`This email is already registered as a ${existingUser.role}. Please use the ${existingUser.role} portal.`, constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                const user = yield this._Service.createUser({
                    name: payload.given_name,
                    email: payload.email,
                    role,
                });
                console.log('Created User:', user);
                if (!user || !user._id || !user.email || !user.role) {
                    throw new Error("User data is missing or incomplete");
                }
                const accessToken = this._jwtService.generateAccessToken({
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                });
                const refreshToken = this._jwtService.generateRefreshToken({
                    id: user._id.toString(),
                    email: user.email,
                    role: user.role,
                });
                (0, cookieHelper_1.setAuthCookies)(res, accessToken, refreshToken, `${role}AccessToken`, `${role}RefreshToken`);
                res.status(200).json({ message: "Authentication successful", userData: user });
            }
            catch (error) {
                console.error('Error caught in the catch block:', error);
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ success: false, message: error.message });
                    return;
                }
                console.error("Google Auth Error:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
}
exports.Controller = Controller;
