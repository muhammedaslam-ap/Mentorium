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
exports.WalletRepository = void 0;
const walletModel_1 = require("../models/walletModel");
class WalletRepository {
    getBalance(userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!userId) {
                throw new Error("this user not in wallet");
            }
            const wallet = yield walletModel_1.WalletModel.findOne({ userId });
            if (!wallet) {
                throw new Error("Wallet not found for this user");
            }
            return {
                _id: wallet._id.toString(),
                userId: wallet.userId.toString(),
                balance: wallet.balance,
            };
        });
    }
}
exports.WalletRepository = WalletRepository;
