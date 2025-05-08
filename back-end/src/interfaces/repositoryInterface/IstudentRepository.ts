import { IStudentProfile } from "../../types/student";
import { TUserRegister } from "../../types/user";

export interface IStudentRepository {
  
  createStudentProfile(tutorId: string, profileData: IStudentProfile): Promise<void>;
  updateStudentProfile(id: string, reason: IStudentProfile): Promise<void>;
  getStudentProfile(id: string): Promise<IStudentProfile | null>;
  getStudentDetails(studentId: string): Promise<TUserRegister | null>
  
}
