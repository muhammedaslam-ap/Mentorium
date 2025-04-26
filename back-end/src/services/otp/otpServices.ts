import { IOtpService } from "../../interfaces/serviceInterface/IOtpServerces";
import { TOtp, TVerifyOtpToRegister } from "../../types/otp";
import { transporter } from "../../mail/sendMail";
import { generateOtp } from "../../utils/genarateOTP";
import { config } from "../../shared/mailTemplate";
import { IOtpRepository } from "../../interfaces/repositoryInterface/IotpRepository";

import { CustomError } from "../../utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { TUserModel } from "../../types/user";
import { IUserRepository } from "../../interfaces/repositoryInterface/IuserRepository";

export class OtpService implements IOtpService {
  constructor(
    private _otpRepository: IOtpRepository,
  private _userRepository: IUserRepository 
) {}

async checkExistingUser(email: string): Promise<TUserModel | null> {
  const user = await this._userRepository.findByEmail(email);
  console.log('nee sherikum indo ???:',user)
  if (user) {
    throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.BAD_REQUEST);
  }
  return user
}



  async otpGenerate(data: Omit<TOtp, "otp">): Promise<void> {
    const otp = generateOtp();
    console.log("OTP sended:", otp);

    const newOtp = {
      email: data.email,
      otp: otp,
      expiredAt: new Date(Date.now() + 60 * 1000), 
    };

    await this._otpRepository.deleteOtp(data.email)

    console.log(newOtp);
    await this._otpRepository.otpGenerate(newOtp);

    const mailOptions = {
      from: process.env.SENDING_MAIL,
      to: data.email,
      subject: "Sending Email using Nodemailer",
      html: config.otpTemplate(otp),
    };

    try {
      await transporter.sendMail(mailOptions);
    } catch (error) {
      console.log(error);
      
      console.error("Error sending email:", error);
      throw error;
    }
  }

  async verifyOtp(data: TVerifyOtpToRegister): Promise<boolean> {
    const otpEntry = await this._otpRepository.findByEmailAnOtp(data);
    console.log("Entered OTP match result:", otpEntry);

    if (!otpEntry) {
      throw new CustomError(ERROR_MESSAGES.OTP_INVALID, HTTP_STATUS.BAD_REQUEST);
    }

    if (!otpEntry.expiredAt || otpEntry.expiredAt < new Date()) {
      throw new CustomError(ERROR_MESSAGES.OTP_EXPIRED, HTTP_STATUS.GONE);
    }

    await this._otpRepository.deleteOtp(data.email);
    return true;
  }

  

}
