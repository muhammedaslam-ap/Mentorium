"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.MessageRoutes = void 0;
const express_1 = require("express");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const checkUserBlocked_1 = require("../middlewares/checkUserBlocked");
const messageInjection_1 = require("../di/messageInjection"); // Assume DI is set up
class MessageRoutes {
    constructor() {
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.delete('/messages/:messageId', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student', 'tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => messageInjection_1.injectedMessageController.deleteMessage(req, res));
        this.router.post('/messages/:messageId/react', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student', 'tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => messageInjection_1.injectedMessageController.addReaction(req, res));
        this.router.delete('/messages/:messageId/react', userAuthMiddleware_1.userAuthMiddleware, (0, userAuthMiddleware_1.authorizeRole)(['student', 'tutor']), checkUserBlocked_1.checkUserBlocked, (req, res) => {
            messageInjection_1.injectedMessageController.removeReaction(req, res);
        });
    }
}
exports.MessageRoutes = MessageRoutes;
exports.default = new MessageRoutes().router;
