import { IWallet } from '../../types/wallet';

export interface IwalletRepository {
  getBalance(userId: string): Promise<IWallet>;
 
}