import { AuthController } from "../controller/auth.controller";
import { AuthService } from "../services/authServies";
import { UserRepository } from "../repositories/userRepository";
import { JwtService } from "../services/jwt/jwt";


const userRepository = new UserRepository()
const authService = new AuthService(userRepository)
const jwtService = new JwtService()

export const injectedAuthController = new AuthController(authService,jwtService)
