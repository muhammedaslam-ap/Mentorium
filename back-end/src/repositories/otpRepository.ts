import { IOtpRepository } from "../interfaces/repositoryInterface/IotpRepository";
import { otpModel } from "../models/otpModel";
import { userModel } from "../models/userModel";
import { TOtp, TVerifyOtpToRegister } from "../types/otp";
import { TUserModel } from "../types/user";

export class OtpRepository implements IOtpRepository {
  async otpGenerate(data: TOtp): Promise<void> {
    await otpModel.create(data);
  }

  async findByEmail(email: string) {
    return await otpModel.findOne({ email });
  }

  async findByEmailAnOtp(data: TVerifyOtpToRegister): Promise<TOtp | null> {
    return await otpModel.findOne({ email: data.email, otp: data.otp.toString()  });
  }

  async findUserByEmail(email: string): Promise<TUserModel | null> {
    return await userModel.findOne({ email });
  }
  

  async deleteOtp(email: string): Promise<void> {
    await otpModel.deleteOne({ email });
  }
}
