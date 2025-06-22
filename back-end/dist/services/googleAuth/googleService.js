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
exports.GoogleService = void 0;
const constant_1 = require("../../shared/constant");
const custom_error_1 = require("../../utils/custom.error");
class GoogleService {
    constructor(_userRepository) {
        this._userRepository = _userRepository;
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findByEmail(email);
            if (!user) {
                return null;
            }
            return user;
        });
    }
    createUser(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findByEmail(data.email);
            if (user === null || user === void 0 ? void 0 : user.isBlocked) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.ADMIN_BLOCKED, constant_1.HTTP_STATUS.UNAUTHORIZED);
            }
            if (user) {
                return user;
            }
            const newUser = {
                name: data.name,
                email: data.email,
                role: data.role,
                isBlocked: false,
                isAccepted: data.role === "tutor" ? false : true,
            };
            const userData = yield this._userRepository.createUser(newUser);
            if (!userData) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.SERVER_ERROR, constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            return userData;
        });
    }
}
exports.GoogleService = GoogleService;
