"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
exports.transporter = nodemailer_1.default.createTransport({
    host: "smtp.gmail.com", // Replace with your provider's SMTP server
    port: 587, // Port may vary depending on your provider
    secure: false, // Use true for TLS, false for non-TLS (consult your provider)
    auth: {
        user: process.env.EMAIL, // Replace with your email address
        pass: process.env.EMAIL_PASS, // Replace with your email password
    },
});
