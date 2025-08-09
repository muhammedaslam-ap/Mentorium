import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { ICallHistoryService } from "../interfaces/serviceInterface/IcallHistoryServices";

export class CallHistoryController {
  constructor(private callHistoryService: ICallHistoryService) {}

  async getCallHistory(req: CustomRequest, res: Response) {
    try {
      const { role } = req.user;
      const { userId } = req.query;

      const calls = await this.callHistoryService.getCallHistory(role, userId as string);

      return res.status(200).json({ data: calls });
    } catch (err: any) {
      console.error("[ERROR] getCallHistory:", err);
      return res.status(err.status || 500).json({ message: err.message || "Internal error" });
    }
  }
}
