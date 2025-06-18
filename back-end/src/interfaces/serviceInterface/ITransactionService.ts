import { AdminDashboardData } from "../../types/adminDashBoard";
import { TTransaction } from "../../types/transation";

export interface ITransactionService {
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
}