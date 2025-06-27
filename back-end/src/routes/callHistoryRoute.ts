import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { CallHistoryController } from '../controller/callHistoryController';
import { CallHistory } from '../config/socketIO';

export class CallHistoryRoute {
  private callHistoryController = new CallHistoryController
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
  this.router.get(
      '/call-history',
      userAuthMiddleware,
      authorizeRole(['tutor', 'student']),
      checkUserBlocked,
      (req: Request, res: Response) =>{
        console.log("hellow here blaalablaa")
        this.callHistoryController.getCallHistory(req as CustomRequest, res)
    });
  }
}

export default new CallHistoryRoute().router;