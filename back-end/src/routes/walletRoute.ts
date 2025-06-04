import { Request, Response, Router } from 'express';
import {
  userAuthMiddleware,
  authorizeRole,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { injectedWalletController } from '../di/walletInjection';

export class WalletRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }
  initializeRoutes() {
    this.router.get(
      '/wallet',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedWalletController.getWallet(req as CustomRequest, res)
    );
  }
}

export default new WalletRoutes().router;