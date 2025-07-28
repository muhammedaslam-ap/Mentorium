import { Types } from 'mongoose';
import { Request } from 'express';
import { TPaginatedResult } from './common';
import { MulterS3File } from './multer';

export type TTutorModel = {
  name: string;
  email: string;
  password?: string | null | undefined;
  role: string;
  _id?: Types.ObjectId;
  isBlocked: boolean;
  isAccepted?: boolean;
  specialization: string;
  verificationDocUrl: string;
  approvalStatus: string;
  phone: string;
  bio: string;
  rejectionReason?: string;
};

export  interface TutorProfileRequest extends Request {
  body: {
    tutorId: string;
    name: string;
    specialization: string;
    phone: string;
    bio?: string;
  };
  file: MulterS3File;
}

export type TTutorPaginatedResult = TPaginatedResult<TTutorModel>;

export type TTutorProfileInput = {
  name:string;
  specialization: string;
  phone: string;
  bio?: string;
  approvalStatus ?:string;
  rejectionReason?:string;
  verificationDocUrl:string
};

export interface CustomRequest extends Request {
  user: { id: string };
}

export interface UploadResponse {
  message: string;
  document?: string;
}


export type TutorProfileWithCourses={
  tutorProfile: {
    tutorId: string
    name?: string
    phone?: string
    specialization?: string
    bio?: string
    verificationDocUrl?: string
    approvalStatus: "pending" | "approved" | "rejected"
    rejectionReason?: string
  }
  courses: {
    _id: string
    title: string
    tagline: string
    category: string
    difficulty: "Beginner" | "Intermediate" | "Advanced"
    price: number
    about: string
    thumbnail: string
    tutorId: string
  }[]
}
