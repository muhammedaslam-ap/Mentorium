import { Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { IwalletService } from '../interfaces/serviceInterface/IwalletService';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../shared/constant';

export class WalletController {
  constructor(private walletService: IwalletService) {}

  async getWallet(req: CustomRequest, res: Response): Promise<void> {
    try {
      const userId = req.user?.id;
      console.log(`getWallet - Fetching wallet for userId: ${userId}`);

      if (!userId) {
        console.error('getWallet - No user ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      const wallet = await this.walletService.getWalletById(userId);

      if (!wallet) {
        console.warn(`getWallet - Wallet not found for user: ${userId}`);
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      console.log('getWallet - Wallet retrieved:', wallet);
      res.status(HTTP_STATUS.OK).json({ wallet, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error('getWallet - Server error:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}
