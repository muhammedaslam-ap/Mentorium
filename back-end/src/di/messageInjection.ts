import { MessageController } from "../controller/messageController";
import { MessageRepository } from "../repositories/MessageRepositoty";
import { MessageService } from "../services/messageServices";

const messageRepository = new MessageRepository();
const messageService = new MessageService(messageRepository);

export const injectedMessageController = new MessageController(messageService);