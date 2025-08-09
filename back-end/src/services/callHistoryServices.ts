import { ICallHistoryService } from "../interfaces/serviceInterface/IcallHistoryServices";
import { ICallHistoryRepository } from "../interfaces/repositoryInterface/IcallHistoryRepository";
import { CustomError } from "../utils/custom.error";
import { HTTP_STATUS } from "../shared/constant";
import mongoose from "mongoose";

export class CallHistoryService implements ICallHistoryService {
  constructor(private callHistoryRepository: ICallHistoryRepository) {}

  async getCallHistory(role: string, userId: string) {
    if (!userId || !mongoose.Types.ObjectId.isValid(userId)) {
      throw new CustomError("Missing or invalid userId", HTTP_STATUS.BAD_REQUEST);
    }

    if (!["tutor", "student"].includes(role)) {
      throw new CustomError("Invalid role", HTTP_STATUS.FORBIDDEN);
    }

    return this.callHistoryRepository.getCallHistoryByUserId(role, userId);
  }
}
