import { AuthController } from "../controller/auth.controller";
import { AuthService } from "../services/authServies";
import { UserRepository } from "../repositories/userRepository";
import { JwtService } from "../services/jwt/jwt";
import { OtpService } from "../services/otp/otpServices";
import { OtpRepository } from "../repositories/otpRepository";


const userRepository = new UserRepository()
const otpRepository = new OtpRepository()
const otpServices = new OtpService(otpRepository,userRepository)
const authService = new AuthService(userRepository,otpServices)
const jwtService = new JwtService()

export const injectedAuthController = new AuthController(authService,jwtService)
