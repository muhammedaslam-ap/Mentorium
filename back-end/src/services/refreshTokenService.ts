import { JwtPayload } from "jsonwebtoken";
import { IRefreshTokenService } from "../interfaces/serviceInterface/refreshTokenService";
import { ITokenService } from "../interfaces/jwtTokenInterface";
import { CustomError } from "../utils/custom.error";
import { HTTP_STATUS } from "../shared/constant";

export class RefreshTokenService implements IRefreshTokenService {
  constructor(private _tokenService: ITokenService) {}

  execute(refreshToken: string): {
    role: string;
    accessToken: string;
  } {
    console.log('refresh token inside refreshToken service', refreshToken);
    const payload = this._tokenService.verifyRefreshtoken(refreshToken);
    if (!payload)
      throw new CustomError("Invalid refresh token", HTTP_STATUS.BAD_REQUEST);

    return {
      role: (payload as JwtPayload).role,
      accessToken: this.generateAccessToken(payload as JwtPayload),
    };
  }

  verify(refreshToken: string, expectedRole: string): JwtPayload | null {
    const payload = this._tokenService.verifyRefreshtoken(refreshToken);
    if (
      payload &&
      (payload as JwtPayload).role &&
      (payload as JwtPayload).role === expectedRole
    ) {
      return payload as JwtPayload;
    }
    return null;
  }

  generateAccessToken(payload: JwtPayload): string {
    return this._tokenService.generateAccessToken({
      id: payload.id,
      email: payload.email,
      role: payload.role,
    });
  }
}
