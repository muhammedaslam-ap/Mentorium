import {
  TPaginationOptions,
  TUpdatePassword,
  TUserModel,
  TUserPaginatedResult,
  TUserRegister,
  TUserWithProfile,
} from "../../types/user";

export interface IUserRepository {
  createUser(data: TUserRegister): Promise<TUserModel>;
  findByEmail(email: string): Promise<TUserModel | null>;
  resetPassword(data: TUpdatePassword): Promise<boolean>;
  getUsers(options: TPaginationOptions): Promise<TUserPaginatedResult>;
  updateStatus(id: string, status: boolean): Promise<void>;
  acceptTutor(tutorId: string): Promise<void>;
  findById(id: string): Promise<TUserModel|null>;
  updatePassword(id:string,newPassword:string):Promise<boolean>;
  findByIdWithProfile(id: string): Promise<TUserWithProfile | null>
}
