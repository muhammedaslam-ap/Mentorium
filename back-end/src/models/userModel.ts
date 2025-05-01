import mongoose, { Schema, model, Model, Document, Types } from "mongoose";
import { TUserModel } from "../types/user";

// 👇 Extend Document for proper typing in Mongoose
export interface TUserDocument extends TUserModel, Document {
  _id: Types.ObjectId;
}

const userSchema = new Schema<TUserDocument>(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String },
    role: {
      type: String,
      enum: ["admin", "student", "tutor"],
      default: "student",
    },
    isBlocked: { type: Boolean, default: false },
    isAccepted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// ✅ Model is now typed as Model<TUserDocument>
export const userModel: Model<TUserDocument> = model<TUserDocument>("User", userSchema);
