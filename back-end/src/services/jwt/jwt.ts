import ms from "ms";
import { ITokenService } from "../../interfaces/jwtTokenInterface";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";

export class JwtService implements ITokenService {
  private _accessSecret: Secret;
  private _accessExpiresIn: string;
  private _refreshExpiresIn: string;

  constructor() {
    this._accessSecret = process.env.JWT_SECRET as Secret;
    this._accessExpiresIn = process.env.JWT_ACCESS_EXPIRES || "";
    this._refreshExpiresIn = process.env.JWT_REFRESH_EXPIRES || "";
  }

  generateAccessToken(payload: {
    id: string;
    email: string;
    role: string;
  }): string {
    return jwt.sign(
      payload,
      this._accessSecret,
      {
        expiresIn: this._accessExpiresIn as ms.StringValue,
      }
    );
  }

  generateRefreshToken(payload: {
    id: string;
    email: string;
    role: string;
  }): string {
    return jwt.sign(payload, this._accessSecret, {
      expiresIn: this._refreshExpiresIn as ms.StringValue,
    });
  }

  verifyAccessToken(token: string): string | JwtPayload | null {
    try {
    //   console.log("Inside verify", this.accessSecret);
    //  console.log("TOKEN:",token);
      return jwt.verify(token, this._accessSecret) as JwtPayload;
    } catch (error) {
      console.error("Access token verification failed:", error);
      return null;
    }
  }

  verifyRefreshtoken(token: string): string | JwtPayload | null {
    try {
      console.log("TOKEN INN REFRESHTOKEN",token)
      return jwt.verify(token, this._accessSecret) as JwtPayload;
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }

  decodeAccessToken(token: string): JwtPayload | null {
    try {
      console.log('token inside the decode token in the toen service', token)
      return jwt.decode(token) as JwtPayload;
    } catch (error) {
      console.error("Refresh token verification failed:", error);
      return null;
    }
  }
}
