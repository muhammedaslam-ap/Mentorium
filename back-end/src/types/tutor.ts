import { Types } from 'mongoose';
import { Request } from 'express';
import { TPaginatedResult } from './common';

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

export type TTutorPaginatedResult = TPaginatedResult<TTutorModel>;

export type TTutorProfileInput = {
  name:string;
  specialization: string;
  phone: string;
  bio: string;
  verificationDocUrl:string
};

export interface CustomRequest extends Request {
  user: { id: string };
}

export interface UploadResponse {
  message: string;
  document?: string;
}