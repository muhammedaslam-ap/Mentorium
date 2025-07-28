"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectedMessageController = void 0;
const messageController_1 = require("../controller/messageController");
const MessageRepositoty_1 = require("../repositories/MessageRepositoty");
const messageServices_1 = require("../services/messageServices");
const messageRepository = new MessageRepositoty_1.MessageRepository();
const messageService = new messageServices_1.MessageService(messageRepository);
exports.injectedMessageController = new messageController_1.MessageController(messageService);
