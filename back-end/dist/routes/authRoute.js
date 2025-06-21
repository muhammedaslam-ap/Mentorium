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
exports.authRoutes = void 0;
const validateDTO_1 = require("../middlewares/validateDTO");
const userValidation_1 = require("../validation/userValidation");
const authInjection_1 = require("../di/authInjection");
const userInjection_1 = require("../di/userInjection");
const express_1 = require("express");
const passwordValidation_1 = require("../validation/passwordValidation");
const userInjection_2 = require("../di/userInjection");
class authRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/register/user', (0, validateDTO_1.validateDTO)(userValidation_1.withoutRoleRegisterSchema), (req, res) => authInjection_1.injectedAuthController.registerUser(req, res));
        this.router.post("/user/login", (req, res) => authInjection_1.injectedAuthController.loginUser(req, res));
        this.router.post("/admin/login", (req, res) => authInjection_1.injectedAuthController.loginUser(req, res));
        this.router.post("/tutor/login", (req, res) => authInjection_1.injectedAuthController.loginUser(req, res));
        this.router.post("/logout", (req, res) => authInjection_1.injectedAuthController.logoutUser(req, res));
        this.router.post("/google-auth", (req, res) => userInjection_1.injectedGoogleController.handle(req, res));
        this.router.post("/refresh-token", (req, res) => userInjection_2.injectedRefreshTokenController.handle(req, res));
        this.router.post("/verifyEmail", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield authInjection_1.injectedAuthController.forgotPassword(req, res);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while processing forgot password." });
            }
        }));
        this.router.post("/verify-otp", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield authInjection_1.injectedAuthController.verifyOtp(req, res);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while verifying OTP." });
            }
        }));
        this.router.post("/reset-password", (0, validateDTO_1.validateDTO)(passwordValidation_1.resetPasswordSchema), (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                yield authInjection_1.injectedAuthController.resetPassword(req, res);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while resetting the password." });
            }
        }));
        this.router.get("/me/:userId", (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                console.log("📦 User data fetched 1");
                yield authInjection_1.injectedAuthController.findUserById(req, res);
            }
            catch (error) {
                res.status(500).json({ error: "An error occurred while checking tutor" });
            }
        }));
    }
}
exports.authRoutes = authRoutes;
