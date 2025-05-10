import mongoose, { Schema } from "mongoose";

const quizSchema = new mongoose.Schema(
  {
    lesson_id: {
      type: Schema.Types.ObjectId,
      ref: "lesson",
      required: true,
    },
    question: {
      type: String,
      required: true,
    },
    options: {
      type: [String], 
      required: true,
    },
    answer: {
      type: String,
      required: true,
    },
  }, 
  {
    timestamps: true,
  }
);

export const quizModel = mongoose.model("quiz", quizSchema);
