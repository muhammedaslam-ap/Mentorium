import { Request, Response, Router } from 'express';
import {
  authorizeRole,
  userAuthMiddleware,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { callHistoryController } from '../di/callHistoryInjection';


export class CallHistoryRoute {
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
        callHistoryController.getCallHistory(req as CustomRequest, res)
    });
  }
}

export default new CallHistoryRoute().router;