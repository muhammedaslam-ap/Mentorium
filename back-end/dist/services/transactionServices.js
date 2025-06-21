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
exports.TransactionService = void 0;
class TransactionService {
    constructor(_transactionRepository) {
        this._transactionRepository = _transactionRepository;
    }
    transactionDetails(walletId, page, limit, filters) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._transactionRepository.transactionDetails(walletId, page, limit, filters);
        });
    }
    fetchDashboardStats() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._transactionRepository.fetchDashboardStats();
        });
    }
    AdminWalletData() {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this._transactionRepository.AdminWalletData();
        });
    }
}
exports.TransactionService = TransactionService;
