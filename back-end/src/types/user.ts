import { Document, Types } from "mongoose";
import { TPaginatedResult } from "./common";
export type TUserRegister = {
  name: string;
  email: string;
  password?: string;
  role: string;
  isBlocked: boolean;
  isAccepted: boolean;
};

export type TEmail = {
  email: string;
};

export type TUserLogin = {
  email: string;
  password: string;
  role: string;
};

export type TOtpVerify = {
  email: string;
  otp: number;
};

export type TUserModel = {
  name: string;
  email: string;
  password?: string | null;
  role: "admin" | "student" | "tutor";
  isBlocked: boolean;
  isAccepted: boolean;
  createdAt?: Date;
  updatedAt?: Date;
  _id?: Types.ObjectId; 
};


// ✅ Add this type to represent just the fields required to create a user
export type TUserCreateInput = Omit<TUserModel, "_id" | "createdAt" | "updatedAt">;

// ✅ Extend Mongoose Document correctly
export interface TUserDocument extends TUserModel, Document<Types.ObjectId> {
  _id: Types.ObjectId;
}

export type TUpdatePassword = {
  email: string;
  newPassword: string;
};

export type TUserPaginatedResult = TPaginatedResult<TUserModel>;

export type TPaginationOptions = {
  page: number;
  pageSize: number;
  total?:number,
  search?: string;
  role?: string;
};



export type TCourseFilterOptions = {
  page: number;
  limit: number;
  search?: string;
  category?: string;
  difficulty?: string;
  minPrice?: number;
  maxPrice?: number;
  sort?: string;
};

export type TUpdateUserProfile = {
  userId: string;
  name: string;
  education: string;
  aboutMe: string;
  interests: string;
};

type TUserProfileFields = {
  education?: string;
  aboutMe?: string;
  interests?: string;
};

export type TUserWithProfile = TUserModel & TUserProfileFields;

export type TStudent = {
  _id: string;
  name: string;
  email: string;
  role: string;
  course: string;
  purchaseDate: Date;
  amount: number;
};