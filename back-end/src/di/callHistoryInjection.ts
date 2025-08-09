import { CallHistoryController } from "../controller/callHistoryController";
import { CallHistoryRepository } from "../repositories/callHistoryRepository";
import { CallHistoryService } from "../services/callHistoryServices";

const callHistoryRepo = new CallHistoryRepository();
const callHistoryService = new CallHistoryService(callHistoryRepo);
export const callHistoryController = new CallHistoryController(callHistoryService);
