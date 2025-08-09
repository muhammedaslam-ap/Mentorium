import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';

import {notificationController} from '../di/notificationInjection'; 

export class NotificationRoute {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  private initializeRoutes(): void {
    this.router.delete(
      '/clear/:userId',
      userAuthMiddleware,
      authorizeRole(['tutor', 'student']),
      checkUserBlocked,
      (req: Request, res: Response) => {
        notificationController.deleteAllNotifications(req as CustomRequest, res);
      }
    );
  }
}

export default new NotificationRoute().router;
