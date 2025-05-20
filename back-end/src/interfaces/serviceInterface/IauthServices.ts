import { TVerifyOtpToRegister } from "../../types/otp";
import { TUpdatePassword, TUserLogin, TUserModel, TUserRegister, TUserWithProfile } from "../../types/user";

export interface IAuthService {
  registerUser(data: TUserRegister): Promise<void>;
  loginUser(data: TUserLogin): Promise<{ user: TUserModel; accessToken: string; refreshToken: string; }>  
  verifyPassword(id: string, password: string): Promise<boolean>;

  forgotPassword(email: string): Promise<void>;
  verifyResetOtp(data: TVerifyOtpToRegister): Promise<boolean>;
  resetPassword(data: TUpdatePassword): Promise<boolean>;

  verifyEmail(email: string): Promise<TUserModel | null>;

  findByIdWithProfile(id: string): Promise<TUserWithProfile | null>

}