"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionRepository = void 0;
const mongoose_1 = __importDefault(require("mongoose"));
const adminWallet_1 = require("../models/adminWallet");
const buyCourseModal_1 = require("../models/buyCourseModal");
const transactionModel_1 = require("../models/transactionModel");
const course_1 = require("../models/course");
const userModel_1 = require("../models/userModel");
class TransactionRepository {
    transactionDetails(walletId_1, page_1, limit_1) {
        return __awaiter(this, arguments, void 0, function* (walletId, page, limit, filters = {}) {
            // const transactions = await TransactionModel.find({ wallet_id: walletId })
            //   .skip((page - 1) * limit)
            //   .limit(limit)
            //   .sort({ transaction_date: -1 })
            //   .populate("purchase_id", "orderId");
            const query = { wallet_id: walletId };
            console.log("FILTERS IN THE REPOSITORY", filters);
            // Apply date range filter
            if (filters.startDate || filters.endDate) {
                query.transaction_date = {};
                if (filters.startDate) {
                    query.transaction_date.$gte = new Date(filters.startDate);
                }
                if (filters.endDate) {
                    query.transaction_date.$lte = new Date(filters.endDate);
                }
            }
            let transactions = yield transactionModel_1.TransactionModel.find(query)
                .populate({
                path: "purchase_id",
                populate: [
                    { path: "userId", select: "name" }, // Populate userId to get the user's name
                    { path: "purchase.courseId", select: "title" }, // Populate courseId to get the course title
                ],
            })
                .lean(); // Convert Mongoose documents to plain JS objects
            console.log("in transaction page");
            if (filters.courseName) {
                const courseNameLower = filters.courseName.toLowerCase();
                transactions = transactions.filter((transaction) => {
                    var _a, _b, _c, _d;
                    const courseTitle = ((_d = (_c = (_b = (_a = transaction.purchase_id) === null || _a === void 0 ? void 0 : _a.purchase) === null || _b === void 0 ? void 0 : _b[0]) === null || _c === void 0 ? void 0 : _c.courseId) === null || _d === void 0 ? void 0 : _d.title) || "";
                    return courseTitle.toLowerCase().includes(courseNameLower);
                });
            }
            const totalTransaction = transactions.length;
            const startIndex = (page - 1) * limit;
            const paginatedTransactions = transactions
                .sort((a, b) => new Date(b.transaction_date).getTime() -
                new Date(a.transaction_date).getTime())
                .slice(startIndex, startIndex + limit);
            return {
                transactions: paginatedTransactions,
                totalTransaction,
            };
        });
    }
    fetchDashboardStats() {
        return __awaiter(this, void 0, void 0, function* () {
            var _a, _b;
            const totalRevenueAgg = yield buyCourseModal_1.purchaseModel.aggregate([
                { $unwind: "$purchase" },
                { $match: { "purchase.status": "succeeded" } },
                {
                    $group: {
                        _id: null,
                        totalRevenue: { $sum: "$purchase.amount" },
                        totalPurchases: { $sum: 1 },
                    },
                },
            ]);
            const totalRevenue = ((_a = totalRevenueAgg[0]) === null || _a === void 0 ? void 0 : _a.totalRevenue) || 0;
            const totalPurchases = ((_b = totalRevenueAgg[0]) === null || _b === void 0 ? void 0 : _b.totalPurchases) || 0;
            const totalTransactions = yield transactionModel_1.TransactionModel.countDocuments({});
            const monthlySales = yield buyCourseModal_1.purchaseModel.aggregate([
                { $unwind: "$purchase" },
                { $match: { "purchase.status": "succeeded" } },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m", date: "$purchase.createdAt" } },
                        revenue: { $sum: "$purchase.amount" },
                        count: { $sum: 1 },
                    },
                },
                { $sort: { _id: 1 } },
            ]);
            const salesByMonth = monthlySales.map((item) => ({
                month: item._id,
                revenue: item.revenue,
                count: item.count,
            }));
            const recentTransactions = yield transactionModel_1.TransactionModel.find()
                .sort({ createdAt: -1 })
                .limit(10)
                .populate({
                path: "wallet_id",
                populate: {
                    path: "userId",
                    model: "user",
                    select: "_id name email",
                },
            })
                .lean();
            const formattedTransactions = recentTransactions.map((tx) => {
                var _a, _b;
                const user = (_a = tx.wallet_id) === null || _a === void 0 ? void 0 : _a.userId;
                return {
                    transactionId: tx.transactionId,
                    amount: tx.amount,
                    transaction_type: tx.transaction_type,
                    description: tx.description,
                    date: tx.transaction_date.toISOString(),
                    user: {
                        _id: ((_b = user === null || user === void 0 ? void 0 : user._id) === null || _b === void 0 ? void 0 : _b.toString()) || "",
                        name: (user === null || user === void 0 ? void 0 : user.name) || "",
                        email: (user === null || user === void 0 ? void 0 : user.email) || "",
                    },
                };
            });
            return {
                totalRevenue,
                totalPurchases,
                totalTransactions,
                salesByMonth,
                recentTransactions: formattedTransactions,
            };
        });
    }
    AdminWalletData() {
        return __awaiter(this, void 0, void 0, function* () {
            const adminWallet = yield adminWallet_1.AdminWalletModel.findOne({}).lean();
            if (!adminWallet) {
                return {
                    balance: 0,
                    transactions: [],
                };
            }
            const formattedTransactions = yield Promise.all(adminWallet.transactions.map((tx) => __awaiter(this, void 0, void 0, function* () {
                var _a, _b;
                let courseTitle = "N/A";
                let tutorName = "N/A";
                try {
                    // Get purchase document
                    const purchaseDoc = yield buyCourseModal_1.purchaseModel.findById(tx.purchase_id).lean();
                    const courseId = (_b = (_a = purchaseDoc === null || purchaseDoc === void 0 ? void 0 : purchaseDoc.purchase) === null || _a === void 0 ? void 0 : _a[0]) === null || _b === void 0 ? void 0 : _b.courseId;
                    const userId = purchaseDoc === null || purchaseDoc === void 0 ? void 0 : purchaseDoc.userId;
                    // Get course and tutor
                    if (courseId && mongoose_1.default.Types.ObjectId.isValid(courseId)) {
                        const courseDoc = yield course_1.courseModel.findById(courseId).lean();
                        courseTitle = (courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc.title) || "N/A";
                        // Get tutor name from user model
                        const tutorId = courseDoc === null || courseDoc === void 0 ? void 0 : courseDoc.tutorId;
                        if (tutorId && mongoose_1.default.Types.ObjectId.isValid(tutorId)) {
                            const tutorDoc = yield userModel_1.userModel.findById(tutorId).lean();
                            tutorName = (tutorDoc === null || tutorDoc === void 0 ? void 0 : tutorDoc.name) || "N/A";
                        }
                    }
                    // Optional fallback to userId (from purchaser)
                    if (tutorName === "N/A" && userId && mongoose_1.default.Types.ObjectId.isValid(userId)) {
                        const userDoc = yield userModel_1.userModel.findById(userId).lean();
                        tutorName = (userDoc === null || userDoc === void 0 ? void 0 : userDoc.name) || "N/A";
                    }
                }
                catch (err) {
                    console.error("Transaction fetch error:", err);
                }
                return {
                    transactionId: tx.transactionId,
                    amount: tx.amount,
                    transaction_type: tx.transaction_type,
                    transaction_date: tx.transaction_date,
                    description: tx.description,
                    courseName: courseTitle,
                    tutorName: tutorName,
                };
            })));
            return {
                balance: adminWallet.balance,
                transactions: formattedTransactions,
            };
        });
    }
}
exports.TransactionRepository = TransactionRepository;
