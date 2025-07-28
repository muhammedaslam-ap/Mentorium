import { MessageModel } from "../config/socketIO";
import { IMessageRepository } from "../interfaces/repositoryInterface/ImessageRepository";
import { Message } from "../types/message";

export class MessageRepository implements IMessageRepository {
  async addReaction(messageId: string, userId: string, emoji: string): Promise<Message | null> {
    return MessageModel.findByIdAndUpdate(
      messageId,
      {
        $addToSet: {
          reactions: { userId, emoji }
        }
      },
      { new: true }
    );
  }

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<Message | null> {
    return MessageModel.findByIdAndUpdate(
      messageId,
      {
        $pull: {
          reactions: { userId, emoji }
        }
      },
      { new: true }
    );
  }


  async deleteMessage(messageId: string): Promise<void> {
    await MessageModel.findByIdAndDelete(messageId);
  }
}