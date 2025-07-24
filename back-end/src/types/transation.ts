import { Types } from "mongoose";

export type TTransaction = {
  _id?: Types.ObjectId;
  transactionId: Types.ObjectId|string;
  purchase_id?: Types.ObjectId|string;
  wallet_id: Types.ObjectId;
  transaction_date?: Date;
  transaction_type?: string;
  amount?: number;
  description?: string;
};


export type PurchaseHistoryItem = {
  courseName: string;
  amount: number;
  status: string;
  orderId: string;
  createdAt: Date;
}



export type TTransactionAdmin = {
  balance: number;
  transactions: {
    transactionId: string;
    amount: number;
    transaction_type: "credit" | "debit";
    transaction_date: Date;
    description: string;
    courseName?: string;
    tutorName?: string;
  }[];
};

