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

      const user = await this._authService.loginUser(data);

      if (!user || !user._id || !user.email || !user.role) {
        throw new Error("User data is missing or incomplete");
      }

      const accessToken = this._jwtService.generateAccessToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });
      const refreshToken = this._jwtService.generateRefreshToken({
        id: user._id.toString(),
        email: user.email,
        role: user.role,
      });

      setAuthCookies(
        res,
        accessToken,
        refreshToken,
        `${data.role}AccessToken`,
        `${data.role}RefreshToken`
      );

      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.LOGIN_SUCCESS,
        user: { id: user?._id, username: user?.name, role :user?.role },
      });
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

  
}
