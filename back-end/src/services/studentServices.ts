import { IStudentRepository } from "../interfaces/repositoryInterface/IstudentRepository";
import { IStudentService } from "../interfaces/serviceInterface/IstudentServices";
import { IStudentProfile } from "../types/student";
import { TUserRegister } from "../types/user";

export class StudentService implements IStudentService {
  private readonly studentRepository: IStudentRepository;

  constructor(studentRepository: IStudentRepository) {
    this.studentRepository = studentRepository;
  }

  async addStudentProfile(studentId: string, profileData: IStudentProfile): Promise<void> {
    try {
      if (!studentId || !profileData) {
        throw new Error("Student ID and profile data are required");
      }

      if (!profileData.aboutMe || !profileData.education || !profileData.interests) {
        throw new Error("aboutMe, education, and interests are required in profile data");
      }

      const existingProfile = await this.studentRepository.getStudentProfile(studentId);
      if (existingProfile) {
        throw new Error("Student profile already exists");
      }

      await this.studentRepository.createStudentProfile(studentId, profileData);
    } catch (error) {
      console.error(`Error adding student profile for studentId: ${studentId}`, error);
      throw error instanceof Error ? error : new Error("Failed to add student profile");
    }
  }

  async updateStudentProfile(studentId: string, profileData: IStudentProfile): Promise<void> {
    try {
      if (!studentId || !profileData) {
        throw new Error("Student ID and profile data are required");
      }

      const existingProfile = await this.studentRepository.getStudentProfile(studentId);
      if (!existingProfile) {
        throw new Error("Student profile not found");
      }

      await this.studentRepository.updateStudentProfile(studentId, profileData);
    } catch (error) {
      console.error(`Error updating student profile for studentId: ${studentId}`, error);
      throw error instanceof Error ? error : new Error("Failed to update student profile");
    }
  }

  async getStudentDetails(studentId:string):Promise<TUserRegister | null>{
    try {
        if (!studentId) {
          throw new Error("Student ID is required");
        }
       const studentDetails =  await this.studentRepository.getStudentDetails(studentId);
       return studentDetails

      } catch (error) {
        console.error(`Error fetching student profile for studentId: ${studentId}`, error);
        throw error instanceof Error ? error : new Error("Failed to fetch student profile");
      }
 }
  

  async getStudentProfile(studentId: string): Promise<IStudentProfile | null> {
    try {
      if (!studentId) {
        throw new Error("Student ID is required");
      }

      const profile = await this.studentRepository.getStudentProfile(studentId);
      return profile;
    } catch (error) {
      console.error(`Error fetching student profile for studentId: ${studentId}`, error);
      throw error instanceof Error ? error : new Error("Failed to fetch student profile");
    }
  }


 
}