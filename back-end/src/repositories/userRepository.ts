import { userModel } from "../models/userModel";
import {
  TUserModel,
  TUserRegister,
} from "../types/user";
import { IUserRepository } from "../interfaces/repositoryInterface/IuserRepository";


export class UserRepository implements IUserRepository {
  async createUser(data: TUserRegister): Promise<TUserModel> {
    const userData = await userModel.create(data);
    return userData;
  }

  async findByEmail(email: string): Promise<TUserModel | null> {
    const user = await userModel.findOne({ email });
    return user;
  }

}
