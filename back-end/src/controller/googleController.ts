import { Request, Response } from "express";
import { IService } from "../interfaces/Auth/Service";
import { CustomError } from "../utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS } from "../shared/constant";
import { OAuth2Client } from "google-auth-library";
import { ITokenService } from "../interfaces/jwtTokenInterface";
import { setAuthCookies } from "../utils/cookieHelper";

export class Controller {
  constructor(
    private _Service: IService,
    private _jwtService: ITokenService
  ) {}

  async handle(req: Request, res: Response) {
    try {
      console.log('Received request body:', req.body); 
      
      const { credentialResponse, role } = req.body;
      const { credential, clientId } = credentialResponse;
  
      console.log('Received credential:', credential);
      console.log('Received clientId:', clientId);
  
      const client = new OAuth2Client();
  
      const ticket = await client.verifyIdToken({
        idToken: credential,
        audience: clientId,
      });
      const payload = ticket.getPayload();
  
      console.log('Token payload:', payload); 
  
      if (!payload || !payload.email || !payload.given_name) {
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN_PAYLOAD);
      }
  
      const existingUser = await this._Service.findByEmail(payload.email);
      console.log('Existing User:', existingUser); 
      console.log('Role mismatch:', role);  
      
      if (!existingUser) {
        console.log('No user found with this email:', payload.email);
      } else if (existingUser.role !== role) {
        throw new CustomError(
          `This email is already registered as a ${existingUser.role}. Please use the ${existingUser.role} portal.`,
          HTTP_STATUS.BAD_REQUEST
        );
      }
  
      const user = await this._Service.createUser({
        name: payload.given_name,
        email: payload.email,
        role,
      });
  
      console.log('Created User:', user); 
  
      if (!user || !user._id || !user.email || !user.role) {
        throw new Error(ERROR_MESSAGES.INVALID_TOKEN_PAYLOAD);
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
        `${role}AccessToken`,
        `${role}RefreshToken`
      );
  
      res.status(200).json({ message: "Authentication successful", userData: user });
  
    } catch (error) {
      console.error('Error caught in the catch block:', error); 
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.error("Google Auth Error:", error); 
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
}
