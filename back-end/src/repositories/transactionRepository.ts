import mongoose, { isValidObjectId } from "mongoose";
import { ITransactionRepository } from "../interfaces/repositoryInterface/ItransactionRepository";
import { AdminWalletModel } from "../models/adminWallet";
import { purchaseModel } from "../models/buyCourseModal";
import { TransactionModel } from "../models/transactionModel";
import { AdminDashboardData } from "../types/adminDashBoard";
import { TTransaction, TTransactionAdmin } from "../types/transation";
import { courseModel } from "../models/course";
import { userModel } from "../models/userModel";


interface PopulatedTutor {
  _id: string;
  name: string;
}

export class TransactionRepository implements ITransactionRepository {
 async transactionDetails(
  walletId: string,
  page: number,
  limit: number,
  filters: {
    courseName?: string;
    startDate?: string;
    endDate?: string;
  } = {}
): Promise<{
  transactions: TTransaction[] | null;
  totalTransaction: number;
}> {
  const query: any = { wallet_id: walletId };
  console.log("FILTERS IN THE REPOSITORY", filters);

  if (filters.startDate || filters.endDate) {
    query.transaction_date = {};
    if (filters.startDate) {
      query.transaction_date.$gte = new Date(filters.startDate);
    }
    if (filters.endDate) {
      query.transaction_date.$lte = new Date(filters.endDate);
    }
  }

  let transactions = await TransactionModel.find(query)
    .populate({
      path: "purchase_id",
      populate: [
        { path: "userId", select: "name" },
        { path: "purchase.courseId", select: "title" },
      ],
    })
    .lean(); 

  console.log("in transaction page");

  transactions = transactions.filter((transaction: any) => {
    const hasValidPurchase = transaction.purchase_id && transaction.purchase_id.userId;
    if (!hasValidPurchase) {
      console.warn("Skipping transaction with missing purchase_id or userId:", transaction);
      return false;
    }
    return true;
  });

  if (filters.courseName) {
    const courseNameLower = filters.courseName.toLowerCase();
    transactions = transactions.filter((transaction: any) => {
      const courseTitle =
        transaction.purchase_id?.purchase?.[0]?.courseId?.title || "";
      return courseTitle.toLowerCase().includes(courseNameLower);
    });
  }

  const totalTransaction = transactions.length;
  const startIndex = (page - 1) * limit;
  const paginatedTransactions = transactions
    .sort(
      (a: any, b: any) =>
        new Date(b.transaction_date).getTime() -
        new Date(a.transaction_date).getTime()
    )
    .slice(startIndex, startIndex + limit);

  return {
    transactions: paginatedTransactions as TTransaction[],
    totalTransaction,
  };
}

   async fetchDashboardStats(): Promise<AdminDashboardData> {
    const totalRevenueAgg = await purchaseModel.aggregate([
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

    const totalRevenue = totalRevenueAgg[0]?.totalRevenue || 0;
    const totalPurchases = totalRevenueAgg[0]?.totalPurchases || 0;

    const totalTransactions = await TransactionModel.countDocuments({});

    const monthlySales = await purchaseModel.aggregate([
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
    const recentTransactions = await TransactionModel.find()
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
    const user = (tx.wallet_id as any)?.userId as any;

      return {
        transactionId: tx.transactionId,
        amount: tx.amount,
        transaction_type: tx.transaction_type,
        description: tx.description,
        date: tx.transaction_date.toISOString(), 
        user: {
          _id: user?._id?.toString() || "",
          name: user?.name || "",
          email: user?.email || "",
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
  }

  async AdminWalletData(): Promise<TTransactionAdmin> {
  const adminWallet = await AdminWalletModel.findOne({}).lean();

  if (!adminWallet) {
    return {
      balance: 0,
      transactions: [],
    };
  }

  const formattedTransactions = await Promise.all(
    adminWallet.transactions.map(async (tx: any) => {
      let courseTitle = "N/A";
      let tutorName = "N/A";

      try {
        // Get purchase document
        const purchaseDoc = await purchaseModel.findById(tx.purchase_id).lean();

        const courseId = purchaseDoc?.purchase?.[0]?.courseId;
        const userId = purchaseDoc?.userId;

        if (courseId && mongoose.Types.ObjectId.isValid(courseId)) {
          const courseDoc = await courseModel.findById(courseId).lean();
          courseTitle = courseDoc?.title || "N/A";

          const tutorId = courseDoc?.tutorId;
          if (tutorId && mongoose.Types.ObjectId.isValid(tutorId)) {
            const tutorDoc = await userModel.findById(tutorId).lean();
            tutorName = tutorDoc?.name || "N/A";
          }
        }

        if (tutorName === "N/A" && userId && mongoose.Types.ObjectId.isValid(userId)) {
          const userDoc = await userModel.findById(userId).lean();
          tutorName = userDoc?.name || "N/A";
        }
      } catch (err) {
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
    })
  );

  return {
    balance: adminWallet.balance,
    transactions: formattedTransactions,
  };
}
}
