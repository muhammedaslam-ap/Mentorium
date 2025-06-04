import { authAxiosInstance } from "@/api/authAxiosInstance"

export interface WalletData {
  balance: number
  currency: string
  lastUpdated?: string
  transactions?: Transaction[]
}

export interface Transaction {
  _id: string
  amount: number
  type: "credit" | "debit" | "pending"
  description: string
  courseTitle?: string
  studentName?: string
  createdAt: string
  status: "completed" | "pending" | "failed"
}

export const walletService = {
  getWallet: async (): Promise<WalletData> => {
    try {
      const response = await authAxiosInstance.get("/wallet/wallet")
      return response.data
    } catch (error) {
      console.error("Error fetching wallet data:", error)
      throw error
    }
  },
}

export default walletService
