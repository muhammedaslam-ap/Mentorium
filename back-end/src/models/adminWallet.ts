import mongoose, { Schema, Document, Model } from "mongoose";

interface Transaction {
  transactionId: string;
  purchase_id?: mongoose.Types.ObjectId;
  transaction_date: Date;
  transaction_type: "credit" | "debit";
  amount: number;
  description: string;
}

interface AdminWallet extends Document {
  balance: number;
  transactions: Transaction[];
  createdAt: Date;
  updatedAt: Date;
}

interface AdminWalletModel extends Model<AdminWallet> {
  getWallet(): Promise<AdminWallet>;
}

const transactionSchema = new Schema<Transaction>(
  {
    transactionId: { type: String, required: true, unique: true },
    purchase_id: { type: Schema.Types.ObjectId, ref: "purchase" },
    transaction_date: { type: Date, default: Date.now, required: true },
    transaction_type: {
      type: String,
      enum: ["credit", "debit"],
      required: true,
    },
    amount: { type: Number, required: true },
    description: { type: String, required: true },
  },
  { _id: false }
);

const adminWalletSchema = new Schema<AdminWallet>(
  {
    balance: { type: Number, required: true, default: 0 },
    transactions: [transactionSchema],
  },
  {
    timestamps: true,
  }
);

// ✅ Define static method on schema
adminWalletSchema.statics.getWallet = async function () {
  let wallet = await this.findOne();
  if (!wallet) {
    wallet = await this.create({ balance: 0, transactions: [] });
  }
  return wallet;
};

export const AdminWalletModel = mongoose.model<AdminWallet, AdminWalletModel>(
  "admin_wallet",
  adminWalletSchema
);
