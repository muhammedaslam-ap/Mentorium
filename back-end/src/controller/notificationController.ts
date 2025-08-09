import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { INotificationService } from "../interfaces/serviceInterface/InotificationServices";

export class NotificationController {
  constructor(private notificationService: INotificationService) {}

  async deleteAllNotifications(req: CustomRequest, res: Response) {
    try {
      const requestingUserId = req.user?.id;
      const { userId: targetUserId } = req.params;

      if (!requestingUserId) return res.status(401).json({ message: "Unauthorized" });

      await this.notificationService.deleteAllNotifications(requestingUserId, targetUserId);

      return res.status(200).json({ message: "All notifications deleted" });
    } catch (err: any) {
      console.error("[ERROR] deleteAllNotifications:", err);
      return res.status(err.status || 500).json({ message: err.message || "Internal error" });
    }
  }
}
