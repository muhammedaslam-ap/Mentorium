import { Request, Response } from "express";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { NotificationModel } from "../models/notificationModel";
import mongoose from "mongoose";

export class NotificationController {
 async deleteAllNotifications(req: CustomRequest, res: Response) {
    try {
      const userId = req.user?.id;
      const { userId: targetUserId } = req.params;

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      if (!targetUserId || !mongoose.Types.ObjectId.isValid(targetUserId)) {
        return res.status(400).json({ message: "Invalid userId" });
      }

      if (userId !== targetUserId) {
        return res.status(403).json({ message: "Forbidden" });
      }

      await NotificationModel.deleteMany({ userId: targetUserId });

      return res.status(200).json({ message: "All notifications deleted" });
    } catch (err) {
      console.error("[ERROR] deleteAllNotifications:", err);
      return res.status(500).json({ message: "Internal server error" });
    }
  }
}