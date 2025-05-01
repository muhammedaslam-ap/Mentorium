import mongoose, { Schema, Document } from 'mongoose';

export interface ITutorProfile extends Document {
  tutorId: mongoose.Types.ObjectId;
  name:string,
  phone: string;
  specialization: string;
  bio: string;
  verificationDocUrl?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  rejectionReason?: string;
}

const tutorProfileSchema = new mongoose.Schema<ITutorProfile>({
  tutorId: {
    type: mongoose.Schema.Types.ObjectId,
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

export const tutorProfileModel = mongoose.model<ITutorProfile>('tutorProfile', tutorProfileSchema);
