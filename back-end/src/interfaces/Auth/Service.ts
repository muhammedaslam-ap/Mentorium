import { TUserModel } from "../../types/user";

export interface IService {
  createUser(data: {
    name: string;
    email: string;
    role: string;
  }): Promise<TUserModel>;
}
