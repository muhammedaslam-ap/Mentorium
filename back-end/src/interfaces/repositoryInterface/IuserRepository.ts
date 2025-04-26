import {
  TPaginationOptions,
  TUpdatePassword,
  TUserModel,
  TUserPaginatedResult,
  TUserRegister,
} from "../../types/user";

export interface IUserRepository {
  createUser(data: TUserRegister): Promise<void | TUserModel>;
  findByEmail(email: string): Promise<TUserModel | null>;
  resetPassword(data: TUpdatePassword): Promise<boolean>;
  getUsers(options: TPaginationOptions): Promise<TUserPaginatedResult>;
  updateStatus(id: string, status: boolean): Promise<void>;
  acceptTutor(tutorId: string): Promise<void>;
  findById(id: string): Promise<TUserModel|null>;
  updatePassword(id:string,newPassword:string):Promise<boolean>;
}
