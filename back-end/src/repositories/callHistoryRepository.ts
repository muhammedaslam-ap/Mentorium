import mongoose from "mongoose";
import { CallHistory } from "../config/socketIO";
import { ICallHistoryRepository } from "../interfaces/repositoryInterface/IcallHistoryRepository";

export class CallHistoryRepository implements ICallHistoryRepository {
  async getCallHistoryByUserId(role: string, userId: string) {
    const populateField = role === "tutor" ? "studentId" : "tutorId";

    const filter = role === "tutor" ? { tutorId: userId } : { studentId: userId };

    return await CallHistory.find(filter)
      .populate(populateField, "name")
      .sort({ startTime: -1 });
  }
}
