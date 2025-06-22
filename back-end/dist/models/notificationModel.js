"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.NotificationModel = void 0;
// models/notification.ts
const mongoose_1 = __importDefault(require("mongoose"));
const notificationSchema = new mongoose_1.default.Schema({
    userId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "user", required: true },
    type: { type: String, enum: ["approval", "rejection", "chat_message", "call_request"], required: true },
    message: { type: String, required: true },
    reason: { type: String },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
    communityId: { type: String }, // For community chat
    courseTitle: { type: String }, // For community chat
    senderId: { type: mongoose_1.default.Schema.Types.ObjectId, ref: "user" }, // For community chat
    courseId: { type: String }, // For private chat
    studentId: { type: String }, // For private chat
    tutorId: { type: String }, // For private chat
});
exports.NotificationModel = mongoose_1.default.model("Notification", notificationSchema);
