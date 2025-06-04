import mongoose, { Schema } from "mongoose";

const ProgressSchema = new mongoose.Schema({
  userId: {
    type: Schema.Types.ObjectId,
    ref: "user",
    required: true,
  },
  courseId: {
    type: Schema.Types.ObjectId,
    ref: "course",
    required: true,
  },
  lessonId: {
    type: Schema.Types.ObjectId,
    ref: "lesson",
    required: true,
  },
  completedAt: { type: Date, default: Date.now },
});

ProgressSchema.index({ userId: 1, courseId: 1, lessonId: 1 }, { unique: true });

export const progressModel = mongoose.model('progress',ProgressSchema)