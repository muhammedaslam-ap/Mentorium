import { TUserModel } from "../../types/user";

export interface IService {
  findByEmail(email: string): Promise<TUserModel | null>;

  createUser(data: {
    name: string;
    email: string;
    role: string;
  }): Promise<TUserModel>;

}
