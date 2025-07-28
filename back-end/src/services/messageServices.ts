import { IMessageRepository } from "../interfaces/repositoryInterface/ImessageRepository";
import { IMessageServcie } from "../interfaces/serviceInterface/ImessageServices";


export class MessageService implements IMessageServcie {
  constructor(private readonly messageRepo: IMessageRepository) {}

  async addReaction(messageId: string, userId: string, emoji: string) {
    return this.messageRepo.addReaction(messageId, userId, emoji);
  }

  async removeReaction(messageId: string, userId: string,emoji:string) {
    return this.messageRepo.removeReaction(messageId, userId,emoji);
  }

  async deleteMessage(messageId: string) {
    await this.messageRepo.deleteMessage(messageId);
  }
}
