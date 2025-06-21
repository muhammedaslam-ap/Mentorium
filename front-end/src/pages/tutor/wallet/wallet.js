import { jsx as _jsx, jsxs as _jsxs, Fragment as _Fragment } from "react/jsx-runtime";
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
// Skeleton Loader for Wallet Balance
const WalletBalanceSkeleton = () => (_jsxs(Card, { className: "border border-gray-200 dark:border-gray-700", children: [_jsxs(CardHeader, { className: "pb-2", children: [_jsx(Skeleton, { className: "h-4 w-24 mb-1" }), _jsx(Skeleton, { className: "h-8 w-32" })] }), _jsx(CardContent, { children: _jsx(Skeleton, { className: "h-4 w-full" }) })] }));
// Skeleton Loader for Transactions
const TransactionsSkeleton = () => (_jsxs("div", { className: "mt-8", children: [_jsx(Skeleton, { className: "h-6 w-48 mb-4" }), _jsx(Card, { className: "border border-gray-200 dark:border-gray-700", children: _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "p-4 space-y-4", children: Array.from({ length: 3 }).map((_, index) => (_jsx(Skeleton, { className: "h-12 w-full" }, index))) }) }) })] }));
// Memoized Transaction Row Component
const TransactionRow = React.memo(({ transaction, currency, formatCurrency, formatDate, getTransactionIcon, getTransactionStatusBadge, }) => (_jsxs("tr", { className: "hover:bg-gray-50 dark:hover:bg-gray-800/80", children: [_jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: _jsxs("div", { className: "flex items-center", children: [_jsx("div", { className: "flex-shrink-0 h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center mr-3", children: getTransactionIcon(transaction.type) }), _jsxs("div", { children: [_jsx("div", { className: "text-sm font-medium text-gray-900 dark:text-white", children: formatDate(transaction.createdAt) }), _jsx("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: new Date(transaction.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                }) })] })] }) }), _jsxs("td", { className: "px-4 py-4", children: [_jsx("div", { className: "text-sm text-gray-900 dark:text-white", children: transaction.description }), transaction.courseTitle && (_jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Course: ", transaction.courseTitle] })), transaction.studentName && (_jsxs("div", { className: "text-xs text-gray-500 dark:text-gray-400", children: ["Student: ", transaction.studentName] }))] }), _jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: _jsxs("div", { className: `text-sm font-medium ${transaction.type === "credit"
                    ? "text-green-600 dark:text-green-400"
                    : transaction.type === "debit"
                        ? "text-red-600 dark:text-red-400"
                        : "text-yellow-600 dark:text-yellow-400"}`, children: [transaction.type === "credit" ? "+" : transaction.type === "debit" ? "-" : "~", formatCurrency(transaction.amount, currency)] }) }), _jsx("td", { className: "px-4 py-4 whitespace-nowrap", children: getTransactionStatusBadge(transaction.status) })] }, transaction._id)));
const WalletPage = () => {
    const [walletData, setWalletData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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
            }
            catch (walletError) {
                console.error("Error fetching /wallet/wallet:", {
                    message: walletError.message,
                    status: walletError.response?.status,
                    data: walletError.response?.data,
                });
                toast.error("Failed to load wallet data");
            }
            // Fetch transactions
            let transactions = [];
            if (walletId) {
                try {
                    console.log("Fetching /transaction/transaction-details with walletId:", walletId);
                    const transactionResponse = await authAxiosInstance.get("/transaction/transaction-details", {
                        params: {
                            walletId,
                            page: 1,
                            limit: 10, // Adjust limit as needed
                        },
                        signal: controller.signal,
                    });
                    console.log("Transaction Response:", JSON.stringify(transactionResponse.data, null, 2));
                    if (transactionResponse.data?.success) {
                        transactions = transactionResponse.data.transactions.map((tx) => ({
                            _id: tx.transactionId,
                            amount: Number(tx.amount) || 0,
                            type: tx.transaction_type,
                            description: tx.description,
                            courseTitle: tx.description.match(/\(Course ID:\s*(.+?)\)/)?.[1] || "N/A",
                            studentName: tx.purchase_id.userId.name,
                            createdAt: tx.transaction_date || new Date().toISOString(),
                            status: "completed",
                        })) || [];
                    }
                }
                catch (transactionError) {
                    console.error("Error fetching /transaction/transaction-details:", {
                        message: transactionError.message,
                        status: transactionError.response?.status,
                        data: transactionError.response?.data,
                    });
                    toast.error("Failed to load transaction history");
                }
            }
            else {
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
        }
        catch (error) {
            console.error("Error fetching wallet data:", error);
            let errorMessage = "Failed to load wallet data";
            if (error.name === "AbortError") {
                errorMessage = "Request timed out. Please try again.";
            }
            else if (error.response) {
                errorMessage = `Server error: ${error.response.status} ${error.response.data?.message || ""}`;
            }
            setError(errorMessage);
            toast.error(errorMessage);
        }
        finally {
            setLoading(false);
        }
    }, []);
    const formatCurrency = useCallback((amount, currency = "INR") => {
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
    const formatDate = useCallback((dateString) => {
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
    const getTransactionIcon = useCallback((type) => {
        switch (type) {
            case "credit":
                return _jsx(ArrowDownLeft, { className: "h-4 w-4 text-green-500" });
            case "debit":
                return _jsx(ArrowUpRight, { className: "h-4 w-4 text-red-500" });
            case "pending":
                return _jsx(Clock, { className: "h-4 w-4 text-yellow-500" });
            default:
                return _jsx(DollarSign, { className: "h-4 w-4 text-blue-500" });
        }
    }, []);
    const getTransactionStatusBadge = useCallback((status) => {
        switch (status) {
            case "completed":
                return (_jsx(Badge, { variant: "outline", className: "bg-green-50 text-green-700 border-green-200", children: "Completed" }));
            case "pending":
                return (_jsx(Badge, { variant: "outline", className: "bg-yellow-50 text-yellow-700 border-yellow-200", children: "Pending" }));
            case "failed":
                return (_jsx(Badge, { variant: "outline", className: "bg-red-50 text-red-700 border-red-200", children: "Failed" }));
            default:
                return null;
        }
    }, []);
    const memoizedWalletData = useMemo(() => walletData, [walletData]);
    useEffect(() => {
        fetchWalletData();
    }, [fetchWalletData]);
    return (_jsxs("div", { className: "min-h-screen bg-gray-50 dark:bg-gray-900", children: [_jsx(Header, {}), _jsxs("div", { className: "flex", children: [_jsx(Sidebar, { sidebarOpen: sidebarOpen }), _jsx("div", { className: `flex-1 ${sidebarOpen ? "md:ml-64" : ""}`, children: _jsxs("div", { className: "container mx-auto max-w-6xl p-6", children: [_jsxs("div", { className: "mb-8", children: [_jsx("h1", { className: "text-3xl font-bold text-gray-800 dark:text-white mb-2", children: "Tutor Wallet" }), _jsx("p", { className: "text-gray-600 dark:text-gray-300", children: "View your earnings and transaction history" })] }), loading ? (_jsxs("div", { className: "mb-8", children: [_jsx(WalletBalanceSkeleton, {}), _jsx(TransactionsSkeleton, {})] })) : error && !memoizedWalletData ? (_jsx(Card, { className: "border-red-200 bg-red-50 dark:bg-red-900/10 dark:border-red-800 mb-8", children: _jsxs(CardContent, { className: "pt-6", children: [_jsxs("div", { className: "flex items-center gap-3", children: [_jsx("div", { className: "rounded-full bg-red-100 dark:bg-red-900/20 p-2", children: _jsx(Wallet, { className: "h-5 w-5 text-red-600 dark:text-red-400" }) }), _jsxs("div", { children: [_jsx("h3", { className: "font-medium text-red-800 dark:text-red-400", children: "Error Loading Wallet" }), _jsx("p", { className: "text-red-600 dark:text-red-300 text-sm", children: error })] })] }), _jsx("div", { className: "mt-4", children: _jsx(Button, { variant: "outline", className: "border-red-200 text-red-700 hover:bg-red-50 dark:border-red-800 dark:text-red-400 dark:hover:bg-red-900/20", onClick: fetchWalletData, children: "Try Again" }) })] }) })) : (memoizedWalletData && (_jsxs(_Fragment, { children: [_jsxs(Card, { className: "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-sm hover:shadow-md transition-shadow mb-8", children: [_jsxs(CardHeader, { children: [_jsx(CardDescription, { className: "text-gray-500 dark:text-gray-400", children: "Available Balance" }), _jsx(CardTitle, { className: "text-4xl font-bold text-gray-800 dark:text-white", children: formatCurrency(memoizedWalletData.balance, memoizedWalletData.currency) })] }), _jsx(CardContent, { children: memoizedWalletData.lastUpdated && (_jsxs("p", { className: "text-sm text-gray-500 dark:text-gray-400", children: ["Last updated: ", formatDate(memoizedWalletData.lastUpdated)] })) })] }), memoizedWalletData.transactions && memoizedWalletData.transactions.length > 0 && (_jsxs("div", { className: "mb-8", children: [_jsx("h2", { className: "text-xl font-bold text-gray-800 dark:text-white mb-4", children: "Recent Transactions" }), _jsx(Card, { className: "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800", children: _jsx(CardContent, { className: "p-0", children: _jsx("div", { className: "overflow-x-auto", children: _jsxs("table", { className: "w-full", children: [_jsx("thead", { children: _jsxs("tr", { className: "border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50", children: [_jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Date" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Description" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Amount" }), _jsx("th", { className: "px-4 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider", children: "Status" })] }) }), _jsx("tbody", { className: "divide-y divide-gray-200 dark:divide-gray-700", children: memoizedWalletData.transactions.map((transaction) => (_jsx(TransactionRow, { transaction: transaction, currency: memoizedWalletData.currency, formatCurrency: formatCurrency, formatDate: formatDate, getTransactionIcon: getTransactionIcon, getTransactionStatusBadge: getTransactionStatusBadge }, transaction._id))) })] }) }) }) })] })), _jsxs(Card, { className: "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800", children: [_jsxs(CardHeader, { children: [_jsx(CardTitle, { className: "text-xl font-bold text-gray-800 dark:text-white", children: "Need Help?" }), _jsx(CardDescription, { className: "text-gray-600 dark:text-gray-300", children: "Contact support for any questions about your wallet" })] }), _jsxs(CardContent, { children: [_jsx("p", { className: "text-gray-600 dark:text-gray-300 mb-4", children: "If you have any questions about your wallet, payments, or transactions, our support team is here to help." }), _jsx(Button, { className: "bg-blue-600 hover:bg-blue-700 text-white", children: "Contact Support" })] })] })] })))] }) })] })] }));
};
export default React.memo(WalletPage);
