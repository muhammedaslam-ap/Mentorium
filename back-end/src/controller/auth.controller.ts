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

      const user = await this._authService.registerUser(data);
      console.log("new user here", user);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.REGISTRATION_SUCCESS,
        tutorId: user._id,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({
          success: false,
          message: error.message,
        });
        return;
      }
      console.log(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async loginUser(req: Request, res: Response) {
    try {
      const data = req.body;

      const { user, accessToken, refreshToken } =
        await this._authService.loginUser(data);
      console.warn("redux data", user);
      setAuthCookies(
        res,
        accessToken,
        refreshToken,
        `${data.role}AccessToken`,
        `${data.role}RefreshToken`
      );

      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: {
          id: user._id,
          username: user.name,
          role: user.role,
          isAccepted: user.isAccepted,
        },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(HTTP_STATUS.FORBIDDEN).json({
          success: false,
          message: ERROR_MESSAGES.FORBIDDEN,
        });
        return;
      }
      console.log(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async logoutUser(req: Request, res: Response) {
    try {
      res.clearCookie("studentAccessToken");
      res.clearCookie("tutorAccessToken")
        .status(HTTP_STATUS.OK)
        .json({ message: SUCCESS_MESSAGES.LOGOUT_SUCCESS });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.log(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      await this._authService.forgotPassword(email);
      res
        .status(HTTP_STATUS.OK)
        .json({ message: SUCCESS_MESSAGES.OTP_SEND_SUCCESS });
    } catch (error: any) {
      console.log(error);
      res
        .status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
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
        return res.status(HTTP_STATUS.UNAUTHORIZED).json({
          message: ERROR_MESSAGES.OTP_INVALID,
        });
      }

      res
        .status(HTTP_STATUS.OK)
        .json({ message: SUCCESS_MESSAGES.VERIFICATION_SUCCESS });
    } catch (error: any) {
      res
        .status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  async resetPassword(req: Request, res: Response) {
    try {
      const data: ResetPasswordDTO = req.body;
      const updated = await this._authService.resetPassword(data);

      if (!updated) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: ERROR_MESSAGES.PASSWORD_RESET_FAILED,
        });
      }

      res
        .status(HTTP_STATUS.OK)
        .json({ message: SUCCESS_MESSAGES.PASSWORD_RESET_SUCCESS });
    } catch (error: any) {
      res
        .status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }

  async findUserById(req: Request, res: Response) {
    try {
      const userId = req.params.userId;
      console.log("hhh", userId);
      if (!userId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          message: ERROR_MESSAGES.USER_ID_REQUIRED,
        });
      }
      const userData = await this._authService.findByIdWithProfile(userId);
      console.log("✅ User data fetched:", userData);

      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        userData,
      });
    } catch (error: any) {
      res
        .status(error.status || HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ message: error.message });
    }
  }
}
