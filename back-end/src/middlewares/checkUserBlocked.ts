import { NextFunction, Response } from "express";
import { CustomRequest } from "./adminAuthMiddleware";
import { userModel } from "../models/userModel";
import { HTTP_STATUS, ERROR_MESSAGES } from "../shared/constant";

export const checkUserBlocked = async (
  req: CustomRequest,
  res: Response,
  next: NextFunction
) => {
  try {
    if (!req.user) {
      res.status(HTTP_STATUS.UNAUTHORIZED).json({
        success: false,
        message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND,
      });
      return;
    }

    const { id } = req.user;
    const user = await userModel.findById(id);
    if (!user) {
      res.status(HTTP_STATUS.NOT_FOUND).json({
        success: false,
        message: ERROR_MESSAGES.USER_NOT_FOUND,
      });
      return;
    }

    if (user.isBlocked) {
      res.status(HTTP_STATUS.FORBIDDEN).json({
        success: false,
        message: ERROR_MESSAGES.BLOCKED,
      });
      return;
    }

    next();
  } catch (error) {
    console.error("Error in blocked status middleware:", error);
    res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
      success: false,
      message: ERROR_MESSAGES.SERVER_ERROR,
    });
    return;
  }
};
