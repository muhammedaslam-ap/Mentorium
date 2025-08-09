export interface INotificationService {
  deleteAllNotifications(requestingUserId: string, targetUserId: string): Promise<void>;
}
