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
exports.WalletController = void 0;
const constant_1 = require("../shared/constant");
class WalletController {
    constructor(walletService) {
        this.walletService = walletService;
    }
    getWallet(req, res) {
        return __awaiter(this, void 0, void 0, function* () {
            var _a;
            try {
                const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a.id;
                console.log(`getWallet - Fetching wallet for userId: ${userId}`);
                if (!userId) {
                    console.error('getWallet - No user ID found');
                    res.status(constant_1.HTTP_STATUS.UNAUTHORIZED).json({ message: constant_1.ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
                    return;
                }
                const wallet = yield this.walletService.getWalletById(userId);
                if (!wallet) {
                    console.warn(`getWallet - Wallet not found for user: ${userId}`);
                    res.status(constant_1.HTTP_STATUS.NOT_FOUND).json({ message: constant_1.ERROR_MESSAGES.USER_NOT_FOUND });
                    return;
                }
                console.log('getWallet - Wallet retrieved:', wallet);
                res.status(constant_1.HTTP_STATUS.OK).json({ wallet, message: constant_1.SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
            }
            catch (error) {
                console.error('getWallet - Server error:', error.message);
                res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: constant_1.ERROR_MESSAGES.SERVER_ERROR });
            }
        });
    }
}
exports.WalletController = WalletController;
