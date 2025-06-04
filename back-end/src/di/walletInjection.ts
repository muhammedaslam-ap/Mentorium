import { WalletRepository } from "../repositories/walletRepository";
import { WalletService } from "../services/walletServices";
import { WalletController } from "../controller/walletController";

const walletRepository = new WalletRepository();
const walletService = new WalletService(walletRepository);
const walletController = new WalletController(walletService);
export const injectedWalletController = walletController;
