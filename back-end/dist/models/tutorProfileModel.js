"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.tutorProfileModel = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const tutorProfileSchema = new mongoose_1.default.Schema({
    tutorId: {
        type: mongoose_1.default.Schema.Types.ObjectId,
        ref: 'user',
        required: true,
    },
    name: {
        type: String,
        required: false,
    },
    phone: {
        type: String,
        required: false,
    },
    specialization: {
        type: String,
        required: false,
    },
    bio: {
        type: String,
        required: false,
    },
    verificationDocUrl: {
        type: String,
        required: false,
    },
    approvalStatus: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    rejectionReason: {
        type: String,
        required: false,
    },
});
exports.tutorProfileModel = mongoose_1.default.model('tutorProfile', tutorProfileSchema);
