

interface TNotification {
  _id: string;
  userId: string;
  type: "approval" | "rejection" | "chat_message";
  message: string;
  reason?: string | null;
  read: boolean;
  createdAt: Date;
  communityId?: string |null;
  courseTitle?: string |null;
  senderId?: string |null;
}

export default TNotification