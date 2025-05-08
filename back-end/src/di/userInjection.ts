import { Controller } from "../controller/googleController";
import { StudentController } from "../controller/studentController";
import { RefreshTokenController } from "../controller/refreshTokenController";
import { GoogleService } from "../services/googleAuth/googleService";
import { JwtService } from "../services/jwt/jwt";
import { RefreshTokenService } from "../services/refreshTokenService";
import { StudentService } from "../services/studentServices";
import { StudentRepository } from "../repositories/studentRepository";
import { UserRepository } from "../repositories/userRepository";

const studentRepository = new StudentRepository();
const userRepository = new UserRepository()
const tokenService = new JwtService();

const studentervice = new StudentService(studentRepository);

const refreshTokenService = new RefreshTokenService(tokenService);
const googleService = new GoogleService(userRepository);

export const injectedUserController = new StudentController(
  studentervice,
);

export const injectedRefreshTokenController = new RefreshTokenController(
  refreshTokenService
);

export const injectedGoogleController = new Controller(
  googleService,
  tokenService
);
