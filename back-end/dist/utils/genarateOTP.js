"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOtp = generateOtp;
function generateOtp() {
    const otp = Math.floor(100000 + Math.random() * 900000);
    return otp;
}
