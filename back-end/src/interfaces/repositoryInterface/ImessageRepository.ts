import {Message} from "../../types/message"

export interface IMessageRepository {
  addReaction(messageId: string, userId: string, emoji: string): Promise<Message | null>;
  removeReaction(messageId: string, userId: string, emoji:string): Promise< Message| null>;
  deleteMessage(messageId: string): Promise<void>;
}