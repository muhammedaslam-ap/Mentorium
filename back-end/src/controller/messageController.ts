import { Request, Response } from "express";
import {IMessageServcie} from "../interfaces/serviceInterface/ImessageServices";
import { CustomRequest } from "../middlewares/userAuthMiddleware";

export class MessageController {
  constructor(private readonly messageService: IMessageServcie) {}

  async addReaction(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { userId, emoji } = req.body;

      const updated = await this.messageService.addReaction(messageId, userId, emoji);
      res.status(200).json({ message: "Reaction added", updated });
    } catch (err) {
      console.error("Error adding reaction:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async removeReaction(req: CustomRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;
      const emoji  = "❤️"

      if (!userId) {
        return res.status(401).json({ message: "Unauthorized: User not authenticated" });
      }

      if (!emoji) {
        return res.status(400).json({ message: "Emoji is required to remove reaction" });
      }

      const updated = await this.messageService.removeReaction(messageId, userId, emoji);
      res.status(200).json({ message: "Reaction removed", updated });
    } catch (err) {
      console.error("Error removing reaction:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      await this.messageService.deleteMessage(messageId);
      res.status(200).json({ message: "Message deleted successfully" });
    } catch (err) {
      console.error("Error deleting message:", err);
      res.status(500).json({ message: "Internal server error" });
    }
  }
}
