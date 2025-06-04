// models/notification.ts
import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "user", required: true },
  type: { type: String, enum: ["approval", "rejection", "chat_message","call_request"], required: true },
  message: { type: String, required: true },
  reason: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
  communityId: { type: String }, // For community chat
  courseTitle: { type: String }, // For community chat
  senderId: { type: mongoose.Schema.Types.ObjectId, ref: "user" }, // For community chat
  courseId: { type: String }, // For private chat
  studentId: { type: String }, // For private chat
  tutorId: { type: String }, // For private chat
});

export const NotificationModel = mongoose.model("Notification", notificationSchema);