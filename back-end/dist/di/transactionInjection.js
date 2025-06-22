"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.injectedTransactionController = void 0;
const transactionController_1 = require("../controller/transactionController");
const transactionRepository_1 = require("../repositories/transactionRepository");
const transactionServices_1 = require("../services/transactionServices");
const transactionRepository = new transactionRepository_1.TransactionRepository();
const transactionService = new transactionServices_1.TransactionService(transactionRepository);
exports.injectedTransactionController = new transactionController_1.TransactionController(transactionService);
