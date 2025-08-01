import { ITokenService } from "../interfaces/jwtTokenInterface";
import { IOtpRepository } from "../interfaces/repositoryInterface/IotpRepository";
import { IUserRepository } from "../interfaces/repositoryInterface/IuserRepository";
import { IAuthService } from "../interfaces/serviceInterface/IauthServices";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";
import { TVerifyOtpToRegister } from "../types/otp";
import {
  TUpdatePassword,
  TUserLogin,
  TUserModel,
  TUserRegister,
  TUserWithProfile,
  TUserDocument
} from "../types/user";
import { comparePassword, hashPassword } from "../utils/bcrypt";
import { CustomError } from "../utils/custom.error";
import { OtpService } from "./otp/otpServices";

export class AuthService implements IAuthService {
  constructor(
    private _userRepository: IUserRepository,
    private _otpService: OtpService,
    private _jwtService:ITokenService
  ) {}

  async registerUser(data: TUserRegister): Promise<TUserModel> {
    const existingUser = await this._userRepository.findByEmail(data.email);

    if (existingUser) {
      if (existingUser.role === data.role) {
        throw new CustomError(ERROR_MESSAGES.EMAIL_EXISTS, HTTP_STATUS.CONFLICT);
      } else {
        throw new CustomError(
          `This email is already registered as a ${existingUser.role}. Please use a different email.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
    }

    const hashedPassword = data.password
      ? await hashPassword(data.password)
      : "";

    const newUser = {
      name: data.name,
      email: data.email,
      password: hashedPassword,
      role: data.role,
      isBlocked: false,
      isAccepted: data.role === "tutor" ? false : true,
    };

    const newuser = await this._userRepository.createUser(newUser);
    return newuser
  }

  async loginUser(data: TUserLogin): Promise<{ user: TUserModel, accessToken: string, refreshToken: string }> {
    const user = await this._userRepository.findByEmail(data.email);
  
    if (!user) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }
  
    if (user.isBlocked) {
      throw new CustomError(ERROR_MESSAGES.ADMIN_BLOCKED, HTTP_STATUS.UNAUTHORIZED);      
    }
  
    if (user.password) {
      const isMatch = await comparePassword(data.password, user.password);
      if (!isMatch) {
        throw new CustomError(ERROR_MESSAGES.INVALID_PASSWORD, HTTP_STATUS.UNAUTHORIZED);
      }
    }
  
    if (user.role !== data.role) {
      throw new CustomError(
        `This email is registered as a ${user.role}. Please log in from the ${user.role} portal.`,
        HTTP_STATUS.BAD_REQUEST
      );
    }
  
    const accessToken = this._jwtService.generateAccessToken({
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    });

    console.log('accessToken->>>>>>>>>>',accessToken)
  
    const refreshToken = this._jwtService.generateRefreshToken({
      id: user._id!.toString(),
      email: user.email,
      role: user.role,
    });
  
    console.log('refreshToken->>>>>>>>>>',refreshToken)

    return { user, accessToken, refreshToken };
  }
  

  async verifyPassword(id: string, password: string): Promise<boolean> {
    const user = await this._userRepository.findById(id);

    if (!user) {
      throw new CustomError(ERROR_MESSAGES.USER_NOT_FOUND, HTTP_STATUS.UNAUTHORIZED);
    }

    if (user.password) {
      const isValid = await comparePassword(password, user.password);
      if (!isValid) {
        throw new CustomError(ERROR_MESSAGES.INVALID_PASSWORD, HTTP_STATUS.UNAUTHORIZED);
      }
      return true;
    }

    return false;
  }

  async forgotPassword(email: string): Promise<void> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }

    await this._otpService.otpGenerate({
      email,
      expiredAt: new Date(Date.now() + 5 * 60 * 1000),
    });
      }

  async verifyResetOtp(data: TVerifyOtpToRegister): Promise<boolean> {
      return await this._otpService.verifyOtp({
          email: data.email,
          otp: Number(data.otp),
        });
  }

async resetPassword(data: TUpdatePassword): Promise<boolean> {
    data.newPassword = await hashPassword(data.newPassword);
    return await this._userRepository.resetPassword(data);
  }

  async verifyEmail(email: string): Promise<TUserModel | null> {
    const user = await this._userRepository.findByEmail(email);
    if (!user) {
      throw new CustomError(ERROR_MESSAGES.EMAIL_NOT_FOUND, HTTP_STATUS.NOT_FOUND);
    }
    return user;
  }


   async  findByIdWithProfile(id: string): Promise<TUserWithProfile | null>{
    return this._userRepository.findByIdWithProfile(id)
  }
}
