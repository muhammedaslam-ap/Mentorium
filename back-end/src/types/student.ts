import mongoose from "mongoose";

export interface IStudentProfile {
  studentId: string;
  education?: string;
  aboutMe?: string;
  interests?: string;
}