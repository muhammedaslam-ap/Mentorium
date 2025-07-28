import {Message} from "../../types/message"

export interface IMessageServcie {
  addReaction(messageId: string, userId: string, emoji: string): Promise<Message | null>;
  removeReaction(messageId: string, userId: string  ,emoji:string): Promise< Message| null>;
  deleteMessage(messageId: string): Promise<void>;
}