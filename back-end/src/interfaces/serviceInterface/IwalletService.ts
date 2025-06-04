import {IWallet} from '../../types/wallet';

export interface IwalletService {
  getWalletById(userId: string): Promise<IWallet | null>;                                  
                       
}