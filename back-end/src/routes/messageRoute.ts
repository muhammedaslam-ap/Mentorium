import { Router, Request, Response } from 'express';
import {
  userAuthMiddleware,
  authorizeRole,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { injectedMessageController } from '../di/messageInjection'; // Assume DI is set up

export class MessageRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    
    this.router.delete(
      '/messages/:messageId',
      userAuthMiddleware,
      authorizeRole(['student', 'tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedMessageController.deleteMessage(req as CustomRequest, res)
    );

    this.router.post(
      '/messages/:messageId/react',
      userAuthMiddleware,
      authorizeRole(['student', 'tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedMessageController.addReaction(req as CustomRequest, res)
    );

    this.router.delete(
      '/messages/:messageId/react',
      userAuthMiddleware,
      authorizeRole(['student', 'tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        injectedMessageController.removeReaction(req as CustomRequest, res)
    });
  }
}

export default new MessageRoutes().router;
