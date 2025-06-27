import React, { useState, useEffect, useCallback, useMemo } from "react";
import { toast } from "sonner";
import { Wallet, ArrowUpRight, ArrowDownLeft, Clock, DollarSign } from "lucide-react";
import { authAxiosInstance } from "@/api/authAxiosInstance";
import Header from "../components/header";
import Sidebar from "../components/sideBar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";

interface WalletData {
  balance: number | string | null;
  currency: string;
  lastUpdated?: string;
  transactions?: Transaction[];
}

interface Transaction {
  _id: string;
  amount: number | string | null;
  type: "credit" | "debit" | "pending";
  description: string;
  courseTitle?: string;
  studentName?: string;
  createdAt: string;
  status: "completed" | "pending" | "failed";
}

// Skeleton Loader for Wallet Balance
const WalletBalanceSkeleton = () => (
  <Card className="border border-gray-200 dark:border-gray-700">
    <CardHeader className="pb-2">
      <Skeleton className="h-4 w-24 mb-1" />
      <Skeleton className="h-8 w-32" />
    </CardHeader>
    <CardContent>
      <Skeleton className="h-4 w-full" />
    </CardContent>
  </Card>
);

// Skeleton Loader for Transactions
const TransactionsSkeleton = () => (
  <div className="mt-8">
    <Skeleton className="h-6 w-48 mb-4" />
    <Card className="border border-gray-200 dark:border-gray-700">
      <CardContent className="p-0">
        <div className="p-4 space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-12 w-full" />
          ))}
        </div>
      </CardContent>
    </Card>
  </div>
);

// Memoized Transaction Row Component
const TransactionRow = React.memo(
  ({
    transaction,
    currency,
    formatCurrency,
    formatDate,
    getTransactionIcon,
    getTransactionStatusBadge,
  }: {
    transaction: Transaction;
    currency: string;
    formatCurrency: (amount: number | string | null, currency?: string) => string;
    formatDate: (dateString: string) => string;
    getTransactionIcon: (type: string) => JSX.Element;
    getTransactionStatusBadge: (status: string) => JSX.Element | null;
  }) => (
    <tr key={transaction._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/80">
      <td className="px-4 py-4 whitespace-nowrap">
        <div className="flex items-center">
          <div className="flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3">
            {getTransactionIcon(transaction.type)}
          </div>
          <div>
            <div className="text-sm font-medium text-gray-900 dark:text-white">
              {formatDate(transaction.createdAt)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400">
              {new Date(transaction.createdAt).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
              })}
            </div>
          </div>
        </div>
      </td>
      <td className="px-4 py-4">
        <div className="text-sm text-gray-900 dark:text-white">{transaction.description}</div>
        {transaction.courseTitle && (
          <div className="text-xs text-gray-500 dark:text-gray-400">Course: {transaction.courseTitle}</div>
        )}
        {transaction.studentName && (
          <div className="text-xs text-gray-500 dark:text-gray-400">Student: {transaction.studentName}</div>
        )}
      </td>
      <td className="px-4 py-4 whitespace-nowrap">
        <div
          className={`text-sm font-medium ${
            transaction.type === "credit"
              ? "text-green-600 dark:text-green-400"
              : transaction.type === "debit"
              ? "text-red-600 dark:text-red-400"
              : "text-yellow-600 dark:text-yellow-400"
          }`}
        >
          {transaction.type === "credit" ? "+" : transaction.type === "debit" ? "-" : "~"}
          {formatCurrency(transaction.amount, currency)}
        </div>
      </td>
      <td className="px-4 py-4 whitespace-nowrap">{getTransactionStatusBadge(transaction.status)}</td>
    </tr>
  )
);

const WalletPage = () => {
  const [walletData, setWalletData] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sidebarOpen] = useState(true);

  const fetchWalletData = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000);

      // Fetch wallet balance and walletId
      let balance = 0;
      let walletId = "";
      let currency = "INR";
      let lastUpdated = new Date().toISOString();
      try {
        console.log("Fetching /wallet/wallet");
        const walletResponse = await authAxiosInstance.get("/wallet/wallet", {
          signal: controller.signal,
        });
        console.log("Wallet Response:", JSON.stringify(walletResponse.data, null, 2));

        if (walletResponse.data?.wallet) {
          balance = Number(walletResponse.data.wallet.balance) || 0;
          walletId = walletResponse.data.wallet._id || "";
          currency = walletResponse.data.currency || "INR";
          lastUpdated = walletResponse.data.wallet.lastUpdated || new Date().toISOString();
        }
      } catch (walletError: any) {
        console.error("Error fetching /wallet/wallet:", {
          message: walletError.message,
          status: walletError.response?.status,
          data: walletError.response?.data,
        });
        toast.error("Failed to load wallet data");
      }

      // Fetch transactions
      let transactions: Transaction[] = [];
if (walletId) {
  try {
    console.log("Fetching /transaction/transaction-details with walletId:", walletId);
    const transactionResponse = await authAxiosInstance.get("/transaction/transaction-details", {
      params: {
        walletId,
        page: 1,
        limit: 10,
      },
      signal: controller.signal,
    });
    console.log("Transaction Response:", JSON.stringify(transactionResponse.data, null, 2));

    if (transactionResponse.data?.success) {
      transactions = transactionResponse.data.transactions.map((tx: any) => ({
        _id: tx.transactionId,
        amount: Number(tx.amount) || 0,
        type: tx.transaction_type,
        description: tx.description,
        courseTitle: tx.purchase_id?.purchase?.[0]?.courseId?.title || "N/A",
        studentName: tx.purchase_id?.userId?.name || "Unknown",
        createdAt: tx.transaction_date || new Date().toISOString(),
        status: "completed",
      })) || [];
    }
  } catch (transactionError: any) {
    console.error("Error fetching /transaction/transaction-details:", {
      message: transactionError.message,
      status: transactionError.response?.status,
      data: transactionError.response?.data,
    });
    toast.error("Failed to load transaction history");
  }
} else {
  console.warn("No walletId available to fetch transactions");
}

      // Set sanitized wallet data
      setWalletData({
        balance,
        currency,
        lastUpdated,
        transactions,
      });

      clearTimeout(timeoutId);
    } catch (error: any) {
      console.error("Error fetching wallet data:", error);
      let errorMessage = "Failed to load wallet data";
      if (error.name === "AbortError") {
        errorMessage = "Request timed out. Please try again.";
      } else if (error.response) {
        errorMessage = `Server error: ${error.response.status} ${error.response.data?.message || ""}`;
      }
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  }, []);

  const formatCurrency = useCallback((amount: number | string | null, currency = "INR") => {
    const parsedAmount = Number(amount);
    if (isNaN(parsedAmount) || !isFinite(parsedAmount)) {
      return `₹0`;
    }
    return new Intl.NumberFormat("en-IN", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(parsedAmount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      return "Invalid Date";
    }
    return new Intl.DateTimeFormat("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
    }).format(date);
  }, []);

  const getTransactionIcon = useCallback((type: string) => {
    switch (type) {
      case "credit":
        return <ArrowDownLeft className="h-4 w-4 text-green-500" />;
      case "debit":
        return <ArrowUpRight className="h-4 w-4 text-red-500" />;
      case "pending":
        return <Clock className="h-4 w-4 text-yellow-500" />;
      default:
        return <DollarSign className="h-4 w-4 text-blue-500" />;
    }
  }, []);

  const getTransactionStatusBadge = useCallback((status: string) => {
    switch (status) {
      case "completed":
        return (
          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
            Completed
          </Badge>
        );
      case "pending":
        return (
          <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
            Pending
          </Badge>
        );
      case "failed":
        return (
          <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
            Failed
          </Badge>
        );
      default:
        return null;
    }
  }, []);

  const memoizedWalletData = useMemo(() => walletData, [walletData]);

  useEffect(() => {
    fetchWalletData();
  }, [fetchWalletData]);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <Header />
      <div className="flex">
        <Sidebar sidebarOpen={sidebarOpen} />
        <div className={`flex-1 ${sidebarOpen ? "md:ml-64" : ""}`}>
          <div className="container mx-auto max-w-6xl p-6">
            <div className="mb-8">
              <h1 className="text-3xl font-bold text-gray-800 dark:text-white mb-2">Tutor Wallet</h1>
              <p className="text-gray-600 dark:text-gray-300">View your earnings and transaction history</p>
            </div>

            {loading ? (
              <div className="mb-8">
                <WalletBalanceSkeleton />
                <TransactionsSkeleton />
              </div>
            ) : error && !memoizedWalletData ? (
              <Card className="border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 mb-8">
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3">
                    <div className="rounded-full bg-red-100 dark:bg-red-900/20 p-2">
                      <Wallet className="h-5 w-5 text-red-600 dark:text-red-400" />
                    </div>
                    <div>
                      <h3 className="font-medium text-red-800 dark:text-red-400">Error Loading Wallet</h3>
                      <p className="text-red-600 dark:text-red-300 text-sm">{error}</p>
                    </div>
                  </div>
                  <div className="mt-4">
                    <Button
                      variant="outline"
                      className="border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20"
                      onClick={fetchWalletData}
                    >
                      Try Again
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              memoizedWalletData && (
                <>
                  <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow mb-8">
                    <CardHeader>
                      <CardDescription className="text-gray-500 dark:text-gray-400">Available Balance</CardDescription>
                      <CardTitle className="text-4xl font-bold text-gray-800 dark:text-white">
                        {formatCurrency(memoizedWalletData.balance, memoizedWalletData.currency)}
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      {memoizedWalletData.lastUpdated && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Last updated: {formatDate(memoizedWalletData.lastUpdated)}
                        </p>
                      )}
                    </CardContent>
                  </Card>

                  {memoizedWalletData.transactions && memoizedWalletData.transactions.length > 0 && (
                    <div className="mb-8">
                      <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-4">Recent Transactions</h2>
                      <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                        <CardContent className="p-0">
                          <div className="overflow-x-auto">
                            <table className="w-full">
                              <thead>
                                <tr className="border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Date
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Description
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Amount
                                  </th>
                                  <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                                    Status
                                  </th>
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                                {memoizedWalletData.transactions.map((transaction) => (
                                  <TransactionRow
                                    key={transaction._id}
                                    transaction={transaction}
                                    currency={memoizedWalletData.currency}
                                    formatCurrency={formatCurrency}
                                    formatDate={formatDate}
                                    getTransactionIcon={getTransactionIcon}
                                    getTransactionStatusBadge={getTransactionStatusBadge}
                                  />
                                ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  )}

                  <Card className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold text-gray-800 dark:text-white">Need Help?</CardTitle>
                      <CardDescription className="text-gray-600 dark:text-gray-300">
                        Contact support for any questions about your wallet
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        If you have any questions about your wallet, payments, or transactions, our support team is here
                        to help.
                      </p>
                      <Button className="bg-blue-600 hover:bg-blue-700 text-white">Contact Support</Button>
                    </CardContent>
                  </Card>
                </>
              )
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default React.memo(WalletPage);