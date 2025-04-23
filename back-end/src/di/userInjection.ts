import { Controller } from "../controller/googleController";
// import { UserController } from "../controller/userController";
import { RefreshTokenController } from "../controller/refreshTokenController";
import { UserRepository } from "../repositories/userRepository";
import { GoogleService } from "../services/googleAuth/googleService";
import { JwtService } from "../services/jwt/jwt";
import { RefreshTokenService } from "../services/refreshTokenService";
// import { UserService } from "../services/userService";
// import { UserProfileRepository } from "../repository/userProfileRepository";

const userRepository = new UserRepository();
// const userProfileRepository = new UserProfileRepository();

const tokenService = new JwtService();

// const userService = new UserService(userRepository,userProfileRepository);

const refreshTokenService = new RefreshTokenService(tokenService);
const googleService = new GoogleService(userRepository);

// export const injectedUserController = new UserController(
//   userService,
//   userRepository,
//   userProfileRepository
// );

export const injectedRefreshTokenController = new RefreshTokenController(
  refreshTokenService
);

export const injectedGoogleController = new Controller(
  googleService,
  tokenService
);
