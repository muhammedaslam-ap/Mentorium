import { TOtp, TVerifyOtpToRegister } from "../../types/otp";
import { TUserModel } from "../../types/user";

export interface IOtpRepository {
  otpGenerate(data: TOtp): Promise<void>;
  findByEmailAnOtp(data: TVerifyOtpToRegister): Promise<TOtp | null>;
  deleteOtp(email: string): Promise<void>;
  findUserByEmail(email: string): Promise<TUserModel | null>;
}
