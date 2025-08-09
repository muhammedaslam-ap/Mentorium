export interface INotificationRepository {
  deleteAllNotifications(userId: string): Promise<void>;
}
