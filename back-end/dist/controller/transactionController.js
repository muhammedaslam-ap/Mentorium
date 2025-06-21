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
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransactionController = void 0;
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
class TransactionController {
    constructor(_transactionService) {
        this._transactionService = _transactionService;
    }
    transactionDetails(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let { walletId, courseName, startDate, endDate } = req.query;
                const filters = {
                    courseName: typeof courseName === "string" ? courseName : undefined,
                    startDate: typeof startDate === "string" ? startDate : undefined,
                    endDate: typeof endDate === "string" ? endDate : undefined,
                };
                if (!walletId || typeof walletId !== "string") {
                    res.status(constant_1.HTTP_STATUS.BAD_REQUEST).json({ error: "walletId is required" });
                    return;
                }
                const page = parseInt(req.query.page) || 1;
                const limit = parseInt(req.query.limit) || 6;
                console.log("PAGE AND LIMIT", page, limit, filters);
                const { transactions, totalTransaction } = yield this._transactionService.transactionDetails(walletId, page, limit, filters);
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    transactions,
                    totalTransaction,
                });
            }
            catch (error) {
                if (error instanceof custom_error_1.CustomError) {
                    res
                        .status(error.statusCode)
                        .json({ success: false, message: error.message });
                    return;
                }
                console.log(error);
                res
                    .status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR)
                    .json({ success: false, message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
    getDashboard(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this._transactionService.fetchDashboardStats();
                res.status(200).json({
                    success: true,
                    data,
                });
                console.log('huhuhuhuh', data);
            }
            catch (error) {
                res.status(500).json({
                    success: false,
                    message: error.message || "Something went wrong",
                });
            }
        });
    }
    getAdminWalletData(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                const data = yield this._transactionService.AdminWalletData();
                res.status(constant_1.HTTP_STATUS.OK).json({
                    success: true,
                    message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
                    data,
                });
            }
            catch (error) {
                console.error("Error in getAdminWalletData:", error);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
                    success: false,
                    message: constant_1.ERROR_MESSAGES.SERVER_ERROR,
                });
            }
        });
    }
}
exports.TransactionController = TransactionController;
