import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { NotificationController } from '../controller/notificationController';

export class NotificationRoute {
  private callHistoryController = new NotificationController
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
  this.router.delete(
      '/clear/:userId',
      userAuthMiddleware,
      authorizeRole(['tutor', 'student']),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        console.log("hellow here blaalablaa")
        this.callHistoryController.deleteAllNotifications(req as CustomRequest, res)
    });
  }
}

export default new NotificationRoute().router;