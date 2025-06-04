import { TransactionController } from "../controller/transactionController";
import { TransactionRepository } from "../repositories/transactionRepository";
import { TransactionService } from "../services/transactionServices";


const transactionRepository = new TransactionRepository();

const transactionService = new TransactionService(transactionRepository);


export const injectedTransactionController=new TransactionController(transactionService)