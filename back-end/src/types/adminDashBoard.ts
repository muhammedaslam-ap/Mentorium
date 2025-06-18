export type AdminDashboardData = {
  totalRevenue: number;
  totalPurchases: number;
  totalTransactions: number;
  salesByMonth: { month: string; revenue: number; count: number }[];
  recentTransactions: {
    transactionId: string;
    amount: number;
    transaction_type: string;
    description: string;
    date: string;
    user: { _id: string; name: string; email: string };
  }[];
};
