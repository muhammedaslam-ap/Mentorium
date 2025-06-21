"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.otpModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const otpSchema = new mongoose_1.default.Schema({
    otp: {
        type: String,
        required: true,
    },
    expiredAt: {
        type: Date,
        required: true,
    },
    email: {
        type: String,
        required: false,
    },
    role: {
        type: String,
        enum: ["student", "tutor"],
    }
});
otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });
exports.otpModel = mongoose_1.default.model("otp", otpSchema);
