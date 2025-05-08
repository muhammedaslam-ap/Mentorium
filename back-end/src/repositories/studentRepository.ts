import { studentProfileModel } from "../models/studentProfileModel";
import { IStudentProfile } from "../types/student";
import { IStudentRepository } from "../interfaces/repositoryInterface/IstudentRepository";
import { TUserRegister } from "../types/user";
import { userModel } from "../models/userModel";

export class StudentRepository implements IStudentRepository {
  async createStudentProfile(studentId: string, studentData: IStudentProfile): Promise<void> {
    try {
      const newStudentProfileDetails = {
        studentId,
        aboutMe: studentData.aboutMe,
        education: studentData.education,
        interests: studentData.interests,
      };

      await studentProfileModel.create(newStudentProfileDetails);
    } catch (error) {
      console.error(`Error creating student profile for studentId: ${studentId}`, error);
      throw error;
    }
  }

  async getStudentProfile(studentId: string): Promise<IStudentProfile | null> {
    try {
      return await studentProfileModel.findOne({ studentId });
    } catch (error) {
      console.error(`Error fetching student profile for studentId: ${studentId}`, error);
      throw error;
    }
  }

  async getStudentDetails(studentId: string): Promise<TUserRegister | null> {
    try {
      return await userModel.findById( studentId );
    } catch (error) {
      console.error(`Error fetching student profile for studentId: ${studentId}`, error);
      throw error;
    }
  }

  async updateStudentProfile(studentId: string, studentData: IStudentProfile): Promise<void> {
    try {
      const result = await studentProfileModel.updateOne(
        { studentId },
        { $set: { ...studentData, updatedAt: new Date() } }
      );
      if (result.matchedCount === 0) {
        throw new Error("Student profile not found");
      }
    } catch (error) {
      console.error(`Error updating student profile for studentId: ${studentId}`, error);
      throw error;
    }
  }
}