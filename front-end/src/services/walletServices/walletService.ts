import { authAxiosInstance } from "@/api/authAxiosInstance";

// Interfaces

export interface Transaction {
  _id?: string;
  transactionId: string;
  amount: number;
  transaction_type: "credit" | "debit" | "pending";
  transaction_date: string;
  description: string;
  courseName?: string;
  tutorName?: string;
  studentName?: string;
  createdAt?: string;
  status?: "completed" | "pending" | "failed";
}

export interface WalletData {
  balance: number;
  currency?: string;
  lastUpdated?: string;
  transactions: Transaction[];
}

interface ApiResponse {
  success: boolean;
  message: string;
  data: WalletData;
}

// Service

export const walletService = {
  // Fetch wallet data for the authenticated user
  getWallet: async (): Promise<WalletData> => {
    try {
      const response = await authAxiosInstance.get<ApiResponse>("/wallet/wallet");
      return response.data.data;
    } catch (error) {
      console.error("Error fetching wallet data:", error);
      throw error;
    }
  },

  // Fetch admin wallet data
  getAdminWalletData: async (): Promise<WalletData> => {
    try {
      const response = await authAxiosInstance.get<ApiResponse>("/transaction/admin-wallet-details");

      if (response.data.success) {
        return response.data.data;
      } else {
        throw new Error(response.data.message || "Failed to fetch wallet data");
      }
    } catch (error) {
      console.error("Error fetching admin wallet data:", error);
      throw error;
    }
  },

  // Filter transactions by type
  getTransactionsByType: (transactions: Transaction[], type: string): Transaction[] => {
    return transactions.filter(
      (tx) => tx.transaction_type.toLowerCase() === type.toLowerCase()
    );
  },

  // Filter transactions by date range
  getTransactionsByDateRange: (transactions: Transaction[], startDate: Date, endDate: Date): Transaction[] => {
    return transactions.filter((tx) => {
      const txDate = new Date(tx.transaction_date);
      return txDate >= startDate && txDate <= endDate;
    });
  },

  // Calculate total amount by transaction type
  calculateTotalByType: (transactions: Transaction[], type: string): number => {
    return walletService
      .getTransactionsByType(transactions, type)
      .reduce((total, tx) => total + tx.amount, 0);
  },

  // Export transactions to CSV
  exportTransactionsToCSV: (transactions: Transaction[]): void => {
    if (!transactions.length) return;

    const csvContent = [
      ["Transaction ID", "Amount", "Type", "Date", "Description", "Course", "Tutor"],
      ...transactions.map((tx) => [
        tx.transactionId,
        tx.amount.toString(),
        tx.transaction_type,
        tx.transaction_date,
        tx.description,
        tx.courseName || "-",
        tx.tutorName || "-",
      ]),
    ]
      .map((row) => row.join(","))
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `admin-wallet-transactions-${new Date().toISOString().split("T")[0]}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  },
};

export default walletService;
