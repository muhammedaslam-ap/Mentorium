"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectedAuthController = void 0;
const auth_controller_1 = require("../controller/auth.controller");
const authServies_1 = require("../services/authServies");
const userRepository_1 = require("../repositories/userRepository");
const jwt_1 = require("../services/jwt/jwt");
const otpServices_1 = require("../services/otp/otpServices");
const otpRepository_1 = require("../repositories/otpRepository");
const userRepository = new userRepository_1.UserRepository();
const otpRepository = new otpRepository_1.OtpRepository();
const otpServices = new otpServices_1.OtpService(otpRepository, userRepository);
const jwtService = new jwt_1.JwtService();
// 👇 Pass jwtService into authService
const authService = new authServies_1.AuthService(userRepository, otpServices, jwtService);
exports.injectedAuthController = new auth_controller_1.AuthController(authService, jwtService);
