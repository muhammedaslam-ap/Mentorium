import { IUserRepository } from "../interfaces/repositoryInterface/IuserRepository";
import { ITutorRepository } from "../interfaces/repositoryInterface/ItutorRepository";
import { IAdminService } from "../interfaces/serviceInterface/IadminServices";
import {  TPaginationOptions, TUserModel } from "../types/user";
import { TUserPaginatedResult } from "../types/user";

export class AdminService implements IAdminService {
  constructor(
    private _userRepository: IUserRepository,
    private _tutorRepository: ITutorRepository
  ) {}
  async acceptTutor(tutorId: string): Promise<void> {
    await this._userRepository.acceptTutor(tutorId);
  }
  async updateRejectedReason(id: string, reason: string): Promise<void> {
    await this._tutorRepository.updateRejectedReason(id, reason);
  }

 
  async usersList(options: TPaginationOptions): Promise<TUserPaginatedResult> {
    const { page, pageSize, search, role } = options;
  
    const { data, total } = await this._userRepository.getUsers({
      page,
      pageSize,
      search,
      role,
    });
  
    return {
      data,
      total,
      page,
      pageSize,
      totalPages: Math.ceil(total / pageSize),
    };
  }
  

  async updateStatus(id: string, status: boolean): Promise<void> {
    await this._userRepository.updateStatus(id, status);
    
  }
}
