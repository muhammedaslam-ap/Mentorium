import { IGoogleService } from "../../interfaces/goolgleAuth/googleService";
import { IUserRepository } from "../../interfaces/repositoryInterface/IuserRepository";
import { ERROR_MESSAGES, HTTP_STATUS } from "../../shared/constant";
import { TUserModel } from "../../types/user";
import { CustomError } from "../../utils/custom.error";

export class GoogleService implements IGoogleService {
    constructor(private _userRepository: IUserRepository) {}
  
    async createUser(data: {
      name: string;
      email: string;
      role: string;
    }): Promise<TUserModel> {
      const user = await this._userRepository.findByEmail(data.email);
  
      if (user?.isBlocked) {
        throw new CustomError(
          ERROR_MESSAGES.ADMIN_BLOCKED,
          HTTP_STATUS.UNAUTHORIZED
        );
      }
  
      if (user) {
        return user;
      }
  
      const newUser = {
        name: data.name,
        email: data.email,
        role: data.role,
        isBlocked: false,
        isAccepted: data.role === "tutor" ? false : true,
      };
  
      const userData = await this._userRepository.createUser(newUser);
  
      if (!userData) {
        throw new CustomError(
          ERROR_MESSAGES.SERVER_ERROR,
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
  
      return userData;
    }
  }
  