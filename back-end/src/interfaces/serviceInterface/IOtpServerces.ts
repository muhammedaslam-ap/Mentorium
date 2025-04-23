import { TOtp, TVerifyOtpToRegister } from "../../types/otp";
import { TUserModel } from "../../types/user";


export interface IOtpService {
  otpGenerate(data: TOtp): Promise<void>;
  verifyOtp(data:TVerifyOtpToRegister):Promise<boolean>
  checkExistingUser(email: string ): Promise<TUserModel | null>;
}