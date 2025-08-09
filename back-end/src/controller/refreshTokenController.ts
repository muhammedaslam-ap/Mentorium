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
import { RefreshTokenService } from "../services/refreshTokenService";
import { IRefreshTokenService } from "../interfaces/serviceInterface/refreshTokenService";

export class RefreshTokenController {
  constructor(
    private _refreshTokenService: IRefreshTokenService,
  ) {}
 async handle(req: Request, res: Response): Promise<void> {
  try {
    console.log('inside refresh token controller ======>', req.cookies);

    const { studentRefreshToken, tutorRefreshToken, adminRefreshToken } = req.cookies;

    const refreshedRoles: string[] = [];

    // Student
    if (studentRefreshToken && !req.cookies.studentAccessToken) {
      const studentPayload = this._refreshTokenService.verify(studentRefreshToken, "student");
      if (studentPayload) {
        const accessToken = this._refreshTokenService.generateAccessToken(studentPayload);
        updateCookieWithAccessToken(res, accessToken, "studentAccessToken");
        refreshedRoles.push("student");
      }
    }

    // Tutor
    if (tutorRefreshToken && !req.cookies.tutorAccessToken) {
      const tutorPayload = this._refreshTokenService.verify(tutorRefreshToken, "tutor");
      if (tutorPayload) {
        const accessToken = this._refreshTokenService.generateAccessToken(tutorPayload);
        updateCookieWithAccessToken(res, accessToken, "tutorAccessToken");
        refreshedRoles.push("tutor");
      }
    }

    // Admin
    if (adminRefreshToken && !req.cookies.adminAccessToken) {
      const adminPayload = this._refreshTokenService.verify(adminRefreshToken, "admin");
      if (adminPayload) {
        const accessToken = this._refreshTokenService.generateAccessToken(adminPayload);
        updateCookieWithAccessToken(res, accessToken, "adminAccessToken");
        refreshedRoles.push("admin");
      }
    }

    if (refreshedRoles.length > 0) {
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: "Access tokens refreshed",
        refreshed: refreshedRoles,
      });
    } else {
      res.status(HTTP_STATUS.BAD_REQUEST).json({
        success: false,
        message: "No valid refresh token found or access tokens already exist",
      });
    }
  } catch (error) {
    console.error("Refresh error:", error);

    clearAuthCookies(res, "studentAccessToken", "studentRefreshToken");
    clearAuthCookies(res, "tutorAccessToken", "tutorRefreshToken");
    clearAuthCookies(res, "adminAccessToken", "adminRefreshToken");

    res.status(HTTP_STATUS.UNAUTHORIZED).json({
      success: false,
      message: ERROR_MESSAGES.INVALID_TOKEN,
    });
  }
}
}
