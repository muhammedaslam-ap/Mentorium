import { Document } from "mongoose";

export interface ICallHistoryRepository {
  getCallHistoryByUserId(role: string, userId: string): Promise<Document[]>;
}
