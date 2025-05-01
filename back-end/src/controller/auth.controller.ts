import { Request, Response } from "express";
import { IAuthService } from "../interfaces/serviceInterface/IauthServices";
import { RegisterDTO } from "../validation/userValidation";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomError } from "../utils/custom.error";
import { ITokenService } from "../interfaces/jwtTokenInterface";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { setAuthCookies } from "../utils/cookieHelper";
import { hashPassword } from "../utils/bcrypt";
import { TUpdatePassword } from "../types/user";
import { ResetPasswordDTO } from "../validation/passwordValidation";

export class AuthController {
  constructor(
    private _authService: IAuthService,
    private _jwtService: ITokenService
  ) {}

  async registerUser(req: Request, res: Response) {
    try {
      let data: RegisterDTO = req.body;

      if (data.role == "tutor") {
        data = {
          ...data,
          isAccepted: false,
        };
      }

      await this._authService.registerUser(data);

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }


  async loginUser(req: Request, res: Response) {
    try {
      const data = req.body;
  
      const { user, accessToken, refreshToken } = await this._authService.loginUser(data);
  
      setAuthCookies(
        res,
        accessToken,
        refreshToken,
        `${data.role}AccessToken`,
        `${data.role}RefreshToken`
      );
  
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: { id: user._id, username: user.name, role: user.role },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(HTTP_STATUS.FORBIDDEN).json({ success:false,message: ERROR_MESSAGES.FORBIDDEN });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
  

  async logoutUser(req: Request, res: Response) {
    try {
      res.clearCookie("userAccessToken");
      res
        .clearCookie("tutorAccessToken")
        .status(200)
        .json({ message: "Logout successful" });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

    async forgotPassword(req: Request, res: Response) {
      try {
        const { email } = req.body;
        await this._authService.forgotPassword(email);
        res.status(HTTP_STATUS.OK).json({ message: "OTP sent successfully" });
      } catch (error: any) {
        console.log(error);
        
        res.status(error.status || 500).json({ message: error.message });
      }
    }
  
    async verifyOtp(req: Request, res: Response) {
      try {
        const { email, otp } = req.body;
        const isValid = await this._authService.verifyResetOtp({
          email,
          otp: Number(otp), 
        });
  
        if (!isValid) {
          return res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: "Invalid or expired OTP" });
        }
   
        res.status(HTTP_STATUS.OK).json({ message: "OTP verified successfully" });
      } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
      }
    }
  
    async resetPassword(req: Request, res: Response) {
      try {
        const data: ResetPasswordDTO = req.body; 
        const updated = await this._authService.resetPassword(data);
  
        if (!updated) {
          return res.status(HTTP_STATUS.BAD_REQUEST).json({ message: "Failed to reset password" });
        }
  
        res.status(HTTP_STATUS.OK).json({ message: "Password reset successfully" });
      } catch (error: any) {
        res.status(error.status || 500).json({ message: error.message });
      }
    }

  
}
