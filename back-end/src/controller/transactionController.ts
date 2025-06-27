import { Request, Response } from "express";
import { ITransactionService } from "../interfaces/serviceInterface/ITransactionService";
import { CustomError } from "../utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";

export class TransactionController {
  constructor(private _transactionService: ITransactionService) {}

async transactionDetails(req: Request, res: Response) {
  try {
    let { walletId, courseName, startDate, endDate } = req.query;
    const filters = {
      courseName: typeof courseName === "string" ? courseName : undefined,
      startDate: typeof startDate === "string" ? startDate : undefined,
      endDate: typeof endDate === "string" ? endDate : undefined,
    };

    if (!walletId || typeof walletId !== "string") {
      res.status(HTTP_STATUS.BAD_REQUEST).json({ success: false, message: "walletId is required and must be a string" });
      return;
    }

    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 6;
    console.log("PAGE AND LIMIT", page, limit, filters);

    const { transactions, totalTransaction } =
      await this._transactionService.transactionDetails(
        walletId,
        page,
        limit,
        filters
      );

    if (!transactions) {
      res.status(HTTP_STATUS.NOT_FOUND).json({ success: false, message: "No transactions found" });
      return;
    }

    res.status(HTTP_STATUS.OK).json({
      success: true,
      message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
      transactions,
      totalTransaction,
    });
  } catch (error) {
    if (error instanceof CustomError) {
      res
        .status(error.statusCode)
        .json({ success: false, message: error.message });
      return;
    }
    console.error("[ERROR] transactionDetails:", error);
    res
      .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
      .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
  }
}

   async getDashboard(req: Request, res: Response) {
    try {
      const data = await this._transactionService.fetchDashboardStats();

      res.status(200).json({
        success: true,
        data,
      });
      console.log('huhuhuhuh',data)
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || "Something went wrong",
      });
    }
  }

  async getAdminWalletData(req: Request, res: Response) {
    try {
      const data = await this._transactionService.AdminWalletData();

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        data,
      });
    } catch (error) {
      console.error("Error in getAdminWalletData:", error);

      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
}
