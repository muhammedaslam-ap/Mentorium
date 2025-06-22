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
exports.OtpRepository = void 0;
const otpModel_1 = require("../models/otpModel");
const userModel_1 = require("../models/userModel");
class OtpRepository {
    otpGenerate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            yield otpModel_1.otpModel.create(data);
        });
    }
    findByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield otpModel_1.otpModel.findOne({ email });
        });
    }
    findByEmailAnOtp(data) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield otpModel_1.otpModel.findOne({ email: data.email, otp: data.otp.toString() });
        });
    }
    findUserByEmail(email) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield userModel_1.userModel.findOne({ email });
        });
    }
    deleteOtp(email) {
        return __awaiter(this, void 0, void 0, function* () {
            yield otpModel_1.otpModel.deleteOne({ email });
        });
    }
}
exports.OtpRepository = OtpRepository;
