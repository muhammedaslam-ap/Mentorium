import { IwalletRepository } from '../interfaces/repositoryInterface/IwalletRepository';
import { IWallet } from '../types/wallet';
import { WalletModel } from '../models/walletModel';

export class WalletRepository implements IwalletRepository {
    async getBalance(userId: string): Promise<IWallet> {
        if(!userId){
            throw new Error("this user not in wallet")
        }

        const wallet = await WalletModel.findOne({userId})

    if (!wallet) {
      throw new Error("Wallet not found for this user");
    }

    return {
       _id: wallet._id.toString(),      
      userId: wallet.userId.toString(), 
      balance: wallet.balance,
    }
  
}
}