import mongoose from "mongoose";

const otpSchema = new mongoose.Schema({
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
    required: true, 
    enum: ["student", "tutor"],
    
  }
});

otpSchema.index({ expiredAt: 1 }, { expireAfterSeconds: 0 });

export const otpModel = mongoose.model("otp", otpSchema);