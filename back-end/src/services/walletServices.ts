import { IwalletRepository } from '../interfaces/repositoryInterface/IwalletRepository';
import { IwalletService } from '../interfaces/serviceInterface/IwalletService';
import { IWallet } from '../types/wallet';

export class WalletService implements IwalletService {
  constructor(private walletRepository: IwalletRepository) {}

  async getWalletById(userId: string): Promise<IWallet | null> {
    const balance = await this.walletRepository.getBalance(userId);
    return balance;
  }
}
