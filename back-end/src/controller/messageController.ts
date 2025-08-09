import { Request, Response } from "express";
import { IMessageServcie } from "../interfaces/serviceInterface/ImessageServices";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { ERROR_MESSAGES, SUCCESS_MESSAGES } from "../shared/constant";

export class MessageController {
  constructor(private readonly messageService: IMessageServcie) {}

  async addReaction(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      const { userId, emoji } = req.body;

      const updated = await this.messageService.addReaction(messageId, userId, emoji);
      res.status(200).json({ message: SUCCESS_MESSAGES.REACTION_ADDED, updated });
    } catch (err) {
      console.error("Error adding reaction:", err);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async removeReaction(req: CustomRequest, res: Response) {
    try {
      const { messageId } = req.params;
      const userId = req.user?.id;
      const emoji = "❤️";

      if (!userId) {
        return res.status(401).json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
      }

      if (!emoji) {
        return res.status(400).json({ message: ERROR_MESSAGES.EMOJI_REQUIRED });
      }

      const updated = await this.messageService.removeReaction(messageId, userId, emoji);
      res.status(200).json({ message: SUCCESS_MESSAGES.REACTION_REMOVED, updated });
    } catch (err) {
      console.error("Error removing reaction:", err);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async deleteMessage(req: Request, res: Response) {
    try {
      const { messageId } = req.params;
      await this.messageService.deleteMessage(messageId);
      res.status(200).json({ message: SUCCESS_MESSAGES.MESSAGE_DELETED });
    } catch (err) {
      console.error("Error deleting message:", err);
      res.status(500).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}
