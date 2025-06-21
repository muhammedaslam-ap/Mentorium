import { ITransactionRepository } from "../interfaces/repositoryInterface/ItransactionRepository";
import { ITransactionService } from "../interfaces/serviceInterface/ITransactionService";
import { AdminDashboardData } from "../types/adminDashBoard";
import { TTransaction, TTransactionAdmin } from "../types/transation";

export class TransactionService implements ITransactionService {
  constructor(private _transactionRepository: ITransactionRepository) {}
  async  transactionDetails(
    walletId: string,
    page: number,
    limit: number,
    filters: {
      courseName?: string;
      startDate?: string;
      endDate?: string;
    }
  ): Promise<{
    transactions: TTransaction[] | null;
    totalTransaction: number;
  }>{
    return await this._transactionRepository.transactionDetails(
      walletId,
      page,
      limit,
      filters
    );
  }
   async fetchDashboardStats(): Promise<AdminDashboardData> {
         return await this._transactionRepository.fetchDashboardStats();
   }
    async AdminWalletData(): Promise<TTransactionAdmin> {
    return await this._transactionRepository.AdminWalletData();
  }
}