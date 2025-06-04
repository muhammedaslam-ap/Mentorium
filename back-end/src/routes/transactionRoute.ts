import { Request, Response, Router } from "express";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middlewares/userAuthMiddleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked";
import { injectedTransactionController } from "../di/transactionInjection";

export class TransactionRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.get(
      "/transaction-details",
      userAuthMiddleware,
      authorizeRole(["tutor","admin"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedTransactionController.transactionDetails(req, res)
    );
  }
}


export default new TransactionRoutes().router;