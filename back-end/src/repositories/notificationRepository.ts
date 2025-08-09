import { NotificationModel } from "../models/notificationModel";
import { INotificationRepository } from "../interfaces/repositoryInterface/InotificationRepository";

export class NotificationRepository implements INotificationRepository {
  async deleteAllNotifications(userId: string): Promise<void> {
    await NotificationModel.deleteMany({ userId });
  }
}
