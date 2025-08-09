import { INotificationService } from "../interfaces/serviceInterface/InotificationServices";
import { INotificationRepository } from "../interfaces/repositoryInterface/InotificationRepository";
import { CustomError } from "../utils/custom.error";
import { HTTP_STATUS } from "../shared/constant";

export class NotificationService implements INotificationService {
  constructor(private notificationRepository: INotificationRepository) {}

  async deleteAllNotifications(requestingUserId: string, targetUserId: string): Promise<void> {
    if (!targetUserId) throw new CustomError("Invalid userId", HTTP_STATUS.BAD_REQUEST);
    if (requestingUserId !== targetUserId)
      throw new CustomError("Forbidden", HTTP_STATUS.FORBIDDEN);

    await this.notificationRepository.deleteAllNotifications(targetUserId);
  }
}
