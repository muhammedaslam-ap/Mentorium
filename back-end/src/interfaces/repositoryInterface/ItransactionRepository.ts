import { AdminDashboardData } from "../../types/adminDashBoard";
import { TTransaction } from "../../types/transation";
import { TTransactionAdmin } from "../../types/transation";


export interface ITransactionRepository {
  transactionDetails(
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
  }>;
  fetchDashboardStats(): Promise<AdminDashboardData>


  AdminWalletData():Promise<TTransactionAdmin>

}
