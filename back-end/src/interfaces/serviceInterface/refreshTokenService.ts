import { JwtPayload } from "jsonwebtoken";

export interface IRefreshTokenService {

  execute(refreshToken: string): {
    role: string;
    accessToken: string;
  };


  verify(refreshToken: string, expectedRole: string): JwtPayload | null;


  generateAccessToken(payload: JwtPayload): string;
}
