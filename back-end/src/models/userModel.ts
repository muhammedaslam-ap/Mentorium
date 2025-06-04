import mongoose, { Schema, model, Model, Document, Types } from "mongoose";
import { TUserModel } from "../types/user";

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

export const userModel: Model<TUserDocument> = model<TUserDocument>("user", userSchema);
