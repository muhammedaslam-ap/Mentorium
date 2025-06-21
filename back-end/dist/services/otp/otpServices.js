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
exports.OtpService = void 0;
const sendMail_1 = require("../../mail/sendMail");
const genarateOTP_1 = require("../../utils/genarateOTP");
const mailTemplate_1 = require("../../shared/mailTemplate");
const custom_error_1 = require("../../utils/custom.error");
const constant_1 = require("../../shared/constant");
class OtpService {
    constructor(_otpRepository, _userRepository) {
        this._otpRepository = _otpRepository;
        this._userRepository = _userRepository;
    }
    checkExistingUser(email) {
        return __awaiter(this, void 0, void 0, function* () {
            const user = yield this._userRepository.findByEmail(email);
            console.log('nee sherikum indo ???:', user);
            if (user) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.EMAIL_EXISTS, constant_1.HTTP_STATUS.BAD_REQUEST);
            }
            return user;
        });
    }
    otpGenerate(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const otp = (0, genarateOTP_1.generateOtp)();
            console.log("OTP sended:", otp);
            const newOtp = {
                email: data.email,
                otp: otp,
                expiredAt: new Date(Date.now() + 60 * 1000),
            };
            yield this._otpRepository.deleteOtp(data.email);
            console.log(newOtp);
            yield this._otpRepository.otpGenerate(newOtp);
            const mailOptions = {
                from: process.env.SENDING_MAIL,
                to: data.email,
                subject: "Sending Email using Nodemailer",
                html: mailTemplate_1.config.otpTemplate(otp),
            };
            try {
                yield sendMail_1.transporter.sendMail(mailOptions);
            }
            catch (error) {
                console.log(error);
                console.error("Error sending email:", error);
                throw error;
            }
        });
    }
    verifyOtp(data) {
        return __awaiter(this, void 0, void 0, function* () {
            const otpEntry = yield this._otpRepository.findByEmailAnOtp(data);
            console.log("Entered OTP match result:", otpEntry);
            if (!otpEntry) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.OTP_INVALID, constant_1.HTTP_STATUS.BAD_REQUEST);
            }
            if (!otpEntry.expiredAt || otpEntry.expiredAt < new Date()) {
                throw new custom_error_1.CustomError(constant_1.ERROR_MESSAGES.OTP_EXPIRED, constant_1.HTTP_STATUS.GONE);
            }
            yield this._otpRepository.deleteOtp(data.email);
            return true;
        });
    }
}
exports.OtpService = OtpService;
