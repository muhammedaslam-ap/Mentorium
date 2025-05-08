import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import {
  clearAuthCookies,
  updateCookieWithAccessToken,
} from "../utils/cookieHelper";
import { IRefreshTokenService } from "../interfaces/serviceInterface/refreshTokenService";

export class RefreshTokenController {
  constructor(
    private _refreshTokenService: IRefreshTokenService,
  ) {}
  async handle(req: Request, res: Response): Promise<void> {
    try {

      const token =
        req.cookies.studentRefreshToken ||
        req.cookies.adminRefreshToken ||
        req.cookies.tutorRefreshToken;


        console.log('inside refresh token controller======>',req.cookies )
      
      const newTokens = this._refreshTokenService.execute(
        token 
      );
      const accessTokenName = `${newTokens.role}AccessToken`;
      updateCookieWithAccessToken(res, newTokens.accessToken, accessTokenName);
      res
        .status(HTTP_STATUS.OK)
        .json({ success: true, message: SUCCESS_MESSAGES.OPERATION_SUCCESS });
    } catch (error) {
      clearAuthCookies(
        res,
        `${(req as CustomRequest).user?.role}AccessToken`,
        `${(req as CustomRequest).user?.role}RefreshToken`
      );
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.INVALID_TOKEN });

      console.error(error);

    }
  }
}
