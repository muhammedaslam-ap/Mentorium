import { IStudentProfile } from "../../types/student";
import { TUserRegister } from "../../types/user";


export interface IStudentService {
  addStudentProfile(stundetId: string, profileData: IStudentProfile): Promise<void>;
  updateStudentProfile(stundetId: string, profileData: IStudentProfile):Promise<void>
  getStudentDetails(stundetId:string):Promise<TUserRegister | null>
  getStudentProfile(stundetId: string): Promise<IStudentProfile | null>;
}
