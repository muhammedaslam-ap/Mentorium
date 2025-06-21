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
exports.AuthService = void 0;
const constant_1 = require("../shared/constant");
const bcrypt_1 = require("../utils/bcrypt");
const custom_error_1 = require("../utils/custom.error");
class AuthService {
    constructor(_userRepository, _otpService, _jwtService) {
        this._userRepository = _userRepository;
        this._otpService = _otpService;
        this._jwtService = _jwtService;
    }
    registerUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const existingUser = yield this._userRepository.findByEmail(data.email);
            if (existingUser) {
                if (existingUser.role === data.role) {
                    throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.EMAIL_EXISTS, constant_1.HTTP_STATUS.CONFLICT);
                }
                else {
                    throw new custom_error_1.CustomError(`This email is already registered as a ${existingUser.role}. Please use a different email.`, constant_1.HTTP_STATUS.BAD_REQUEST);
                }
            }
            const hashedPassword = data.password
                ? yield (0, bcrypt_1.hashPassword)(data.password)
                : "";
            const newUser = {
                name: data.name,
                email: data.email,
                password: hashedPassword,
                role: data.role,
                isBlocked: false,
                isAccepted: data.role === "tutor" ? false : true,
            };
            yield this._userRepository.createUser(newUser);
        });
    }
    loginUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findByEmail(data.email);
            if (!user) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.EMAIL_NOT_FOUND, constant_1.HTTP_STATUS.UNAUTHORIZED);
            }
            if (user.isBlocked) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.ADMIN_BLOCKED, constant_1.HTTP_STATUS.UNAUTHORIZED);
            }
            if (user.password) {
                const isMatch = yield (0, bcrypt_1.comparePassword)(data.password, user.password);
                if (!isMatch) {
                    throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.INVALID_PASSWORD, constant_1.HTTP_STATUS.UNAUTHORIZED);
                }
            }
            if (user.role !== data.role) {
                throw new custom_error_1.CustomError(`This email is registered as a ${user.role}. Please log in from the ${user.role} portal.`, constant_1.HTTP_STATUS.BAD_REQUEST);
            }
            const accessToken = this._jwtService.generateAccessToken({
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            console.log('accessToken->>>>>>>>>>', accessToken);
            const refreshToken = this._jwtService.generateRefreshToken({
                id: user._id.toString(),
                email: user.email,
                role: user.role,
            });
            console.log('refreshToken->>>>>>>>>>', refreshToken);
            return { user, accessToken, refreshToken };
        });
    }
    verifyPassword(id, password) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findById(id);
            if (!user) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.USER_NOT_FOUND, constant_1.HTTP_STATUS.UNAUTHORIZED);
            }
            if (user.password) {
                const isValid = yield (0, bcrypt_1.comparePassword)(password, user.password);
                if (!isValid) {
                    throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.INVALID_PASSWORD, constant_1.HTTP_STATUS.UNAUTHORIZED);
                }
                return true;
            }
            return false;
        });
    }
    forgotPassword(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findByEmail(email);
            if (!user) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.EMAIL_NOT_FOUND, constant_1.HTTP_STATUS.NOT_FOUND);
            }
            yield this._otpService.otpGenerate({
                email,
                expiredAt: new Date(Date.now() + 5 * 60 * 1000),
            });
        });
    }
    verifyResetOtp(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._otpService.verifyOtp({
                email: data.email,
                otp: Number(data.otp),
            });
        });
    }
    resetPassword(data) {
        return __awaiter(this, void 0, void 0, function* () {
            data.newPassword = yield (0, bcrypt_1.hashPassword)(data.newPassword);
            return yield this._userRepository.resetPassword(data);
        });
    }
    verifyEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findByEmail(email);
            if (!user) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.EMAIL_NOT_FOUND, constant_1.HTTP_STATUS.NOT_FOUND);
            }
            return user;
        });
    }
    findByIdWithProfile(id) {
        return __awaiter(this, void 0, void 0, function* () {
            return this._userRepository.findByIdWithProfile(id);
        });
    }
}
exports.AuthService = AuthService;
