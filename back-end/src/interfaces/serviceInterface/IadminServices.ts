import { TUserPaginatedResult, TPaginationOptions } from "../../types/user";

export interface IAdminService {
  acceptTutor(tutorId: string): Promise<void>;
  updateRejectedReason(id: string, reason: string): Promise<void>;
  usersList(options: TPaginationOptions): Promise<TUserPaginatedResult>;
  updateStatus(id: string, status: boolean): Promise<void>;
}