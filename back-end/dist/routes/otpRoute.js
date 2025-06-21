"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.OtpRoutes = void 0;
const express_1 = require("express");
const otpInjection_1 = require("../di/otpInjection");
class OtpRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post("/sendOtp", (req, res) => otpInjection_1.injectedOtpController.otpGenerate(req, res));
        this.router.post("/verifyOtp", (req, res) => otpInjection_1.injectedOtpController.verifyOtpToRegister(req, res));
    }
}
exports.OtpRoutes = OtpRoutes;
exports.default = new OtpRoutes().router;
