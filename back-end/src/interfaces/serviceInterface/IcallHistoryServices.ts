import { Document } from "mongoose";

export interface ICallHistoryService {
  getCallHistory(role: string, userId: string): Promise<Document[]>;
}
