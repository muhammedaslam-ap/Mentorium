import { Request, Response, Router } from "express";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middlewares/userAuthMiddleware";
import { adminAuthMiddleware } from "../middlewares/adminAuthMiddleware";
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
  

    this.router.get(
      "/dashBoard",
      adminAuthMiddleware,
      authorizeRole(["admin"]),
      (req: Request, res: Response) =>{
        console.log("hyhyhyhy12345")
        injectedTransactionController.getDashboard(req, res)
    });

    this.router.get(
      "/admin-wallet-details",
      adminAuthMiddleware,
      authorizeRole(["admin"]),
      (req: Request, res: Response) =>
        injectedTransactionController.getAdminWalletData(req, res)
    );
  }


}

export default new TransactionRoutes().router;