import { JwtPayload } from "jsonwebtoken";
import { JwtService } from "../services/jwt/jwt";
import { NextFunction, Request, Response } from "express";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";

const tokenService = new JwtService();

export interface CustomJwtPayload extends JwtPayload {
  id: string;
  email: string;
  role: string;
}

export interface CustomRequest extends Request {
  user: CustomJwtPayload;
  file?: Express.Multer.File;
}

export const userAuthMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    // Check Authorization header first, then cookies
    let token = req.headers.authorization?.startsWith("Bearer ")
      ? req.headers.authorization.split(" ")[1]
      : req.cookies.studentAccessToken ?? req.cookies.tutorAccessToken;

    console.log("userAuthMiddleware - Token:", token); // Debug
    console.log("userAuthMiddleware - Request URL:", req.originalUrl); // Debug
    if (!token) {
      console.log("userAuthMiddleware - No token provided");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }

    const user = tokenService.verifyAccessToken(token) as CustomJwtPayload;
    console.log("userAuthMiddleware - Decoded User:", user); // Debug
    if (!user) {
      console.log("userAuthMiddleware - Invalid user data");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      return;
    }

    (req as CustomRequest).user = user;
    next();
  } catch (error: unknown) {
    if (error instanceof Error && error.name === "TokenExpiredError") {
      console.log("userAuthMiddleware - Token expired");
      res
        .status(HTTP_STATUS.UNAUTHORIZED)
        .json({ message: ERROR_MESSAGES.TOKEN_EXPIRED });
      return;
    }

    console.error("userAuthMiddleware - Invalid token:", error);
    res
      .status(HTTP_STATUS.UNAUTHORIZED)
      .json({ message: ERROR_MESSAGES.INVALID_TOKEN });
  }
};

export const authorizeRole = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const user = (req as CustomRequest).user;
    console.log("authorizeRole - Request URL:", req.originalUrl); // Debug
    console.log("authorizeRole - User:", user); // Debug
    if (!user) {
      console.log("authorizeRole - No user found");
      res.status(HTTP_STATUS.FORBIDDEN).json({
        message: ERROR_MESSAGES.NOT_ALLOWED,
        userRole: "None",
      });
      return;
    }
    const userRole = user.role.toLowerCase();
    const allowedRolesLower = allowedRoles.map((role) => role.toLowerCase());
    if (!allowedRolesLower.includes(userRole)) {
      console.log(
        `authorizeRole - Access denied. Role: ${userRole}, Required: ${allowedRolesLower}`
      );
      res.status(HTTP_STATUS.FORBIDDEN).json({
        message: ERROR_MESSAGES.NOT_ALLOWED,
        userRole: user.role,
      });
      return;
    }
    console.log("authorizeRole - Access granted");
    next();
  };
};