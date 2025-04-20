import { TUpdatePassword, TUserLogin, TUserModel, TUserRegister } from "../../types/user";

export interface IAuthService {
  registerUser(data: TUserRegister): Promise<void>;
  loginUser(data: TUserLogin): Promise<TUserModel | null>;

}