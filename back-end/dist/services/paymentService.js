"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.paymentService = exports.PaymentService = void 0;
// paymentService.ts
const mongoose_1 = __importStar(require("mongoose"));
const stripe_1 = __importDefault(require("stripe"));
const buyCourseModal_1 = require("../models/buyCourseModal");
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
const course_1 = require("../models/course");
const userModel_1 = require("../models/userModel");
const walletModel_1 = require("../models/walletModel");
const adminWallet_1 = require("../models/adminWallet"); // <-- adjust path as needed
class PaymentService {
    constructor() {
        if (!process.env.STRIPE_SECRET_KEY) {
            throw new Error('STRIPE_SECRET_KEY is not defined');
        }
        this.stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
            apiVersion: '2025-04-30.basil',
        });
    }
    createStripePayment(paymentIntentId, amount, currency, courseId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            if (!(0, mongoose_1.isValidObjectId)(courseId) || !(0, mongoose_1.isValidObjectId)(userId)) {
                console.error("Validation error: Invalid courseId or userId", { courseId, userId });
                throw new custom_error_1.CustomError('Invalid courseId or userId', constant_1.HTTP_STATUS.BAD_REQUEST);
            }
            try {
                const course = yield course_1.courseModel.findById(courseId);
                if (!course || !course.tutorId) {
                    throw new custom_error_1.CustomError('Tutor not found for this course', constant_1.HTTP_STATUS.NOT_FOUND);
                }
                const tutor = yield userModel_1.userModel.findById(course.tutorId);
                if (!tutor) {
                    throw new custom_error_1.CustomError('Tutor user not found', constant_1.HTTP_STATUS.NOT_FOUND);
                }
                const tutorName = `${tutor.name}`;
                const courseName = course.title || "Untitled Course";
                const tutorShare = amount * 0.9;
                const adminShare = amount * 0.1;
                yield walletModel_1.WalletModel.findOneAndUpdate({ userId: course.tutorId }, { $inc: { balance: tutorShare } }, { upsert: true, new: true });
                const adminWallet = yield adminWallet_1.AdminWalletModel.getWallet();
                const transactionId = `txn_${Date.now()}`;
                adminWallet.balance += adminShare;
                adminWallet.transactions.push({
                    transactionId,
                    purchase_id: new mongoose_1.default.Types.ObjectId(),
                    transaction_type: "credit",
                    amount: adminShare,
                    description: `10% commission from course "${courseName}" by tutor ${tutorName}`,
                    transaction_date: new Date(),
                });
                yield adminWallet.save();
                const existingPurchase = yield buyCourseModal_1.purchaseModel.findOne({
                    userId,
                    'purchase.orderId': paymentIntentId,
                });
                if (existingPurchase) {
                    console.log("Purchase already exists for paymentIntentId:", paymentIntentId);
                    return;
                }
                yield buyCourseModal_1.purchaseModel.findOneAndUpdate({ userId }, {
                    $push: {
                        purchase: {
                            courseId,
                            orderId: paymentIntentId,
                            amount,
                            currency,
                            status: 'pending',
                            createdAt: new Date(),
                        },
                    },
                }, { upsert: true });
                console.log("Payment recorded successfully.");
            }
            catch (error) {
                console.error("Error in createStripePayment:", error);
                throw new custom_error_1.CustomError('Failed to process Stripe payment', constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateStripePayment(paymentIntentId, status, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("updateStripePayment called", { paymentIntentId, status, userId });
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                console.error("Validation error: Invalid userId", { userId });
                throw new custom_error_1.CustomError('Invalid userId', constant_1.HTTP_STATUS.BAD_REQUEST);
            }
            try {
                const updatedPurchase = yield buyCourseModal_1.purchaseModel.findOneAndUpdate({ userId, 'purchase.orderId': paymentIntentId }, { $set: { 'purchase.$.status': status } }, { new: true });
                if (!updatedPurchase) {
                    console.error("updateStripePayment error: Payment record not found", { userId, paymentIntentId });
                    throw new custom_error_1.CustomError('Payment record not found for the given user and paymentIntentId', constant_1.HTTP_STATUS.NOT_FOUND);
                }
                console.log("updateStripePayment database update result:", updatedPurchase);
            }
            catch (error) {
                console.error("updateStripePayment database error:", error);
                if (error instanceof custom_error_1.CustomError)
                    throw error;
                throw new custom_error_1.CustomError('Failed to update payment status in database', constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    stripePayment(paymentIntentId, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("stripePayment called", { paymentIntentId, userId });
            if (!(0, mongoose_1.isValidObjectId)(userId)) {
                console.error("Validation error: Invalid userId", { userId });
                throw new custom_error_1.CustomError('Invalid userId', constant_1.HTTP_STATUS.BAD_REQUEST);
            }
            try {
                const paymentIntent = yield this.stripe.paymentIntents.retrieve(paymentIntentId);
                if (paymentIntent.status !== 'succeeded') {
                    console.error("stripePayment error: Payment not successful", { paymentIntent });
                    throw new custom_error_1.CustomError('Payment not successful', constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                const updatedPurchase = yield buyCourseModal_1.purchaseModel.findOneAndUpdate({ userId, 'purchase.orderId': paymentIntentId }, { $set: { 'purchase.$.status': 'succeeded' } }, { new: true });
                if (!updatedPurchase) {
                    console.error("stripePayment error: Payment record not found", { userId, paymentIntentId });
                    throw new custom_error_1.CustomError('Payment record not found for the given user and paymentIntentId', constant_1.HTTP_STATUS.NOT_FOUND);
                }
                console.log("stripePayment database update result:", updatedPurchase);
            }
            catch (error) {
                console.error("stripePayment error:", error);
                if (error instanceof custom_error_1.CustomError)
                    throw error;
                throw new custom_error_1.CustomError('Failed to verify and update payment status', constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
        });
    }
    updateEnrollment(courseId, transactionId, amount, userId) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("updateEnrollment called", { courseId, transactionId, amount, userId });
            if (!(0, mongoose_1.isValidObjectId)(courseId) || !(0, mongoose_1.isValidObjectId)(userId)) {
                console.error("Validation error: Invalid courseId or userId", { courseId, userId });
                throw new custom_error_1.CustomError('Invalid courseId or userId', constant_1.HTTP_STATUS.BAD_REQUEST);
            }
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                console.log("Checking for existing purchase", { userId, transactionId });
                const existingPurchase = yield buyCourseModal_1.purchaseModel
                    .findOne({
                    userId,
                    'purchase.orderId': transactionId,
                })
                    .session(session);
                if (existingPurchase) {
                    console.log("Purchase already exists for transactionId:", transactionId);
                    yield session.commitTransaction();
                    return;
                }
                console.log("Adding purchase to database with status 'succeeded'");
                const updatedPurchase = yield buyCourseModal_1.purchaseModel
                    .findOneAndUpdate({ userId }, {
                    $push: {
                        purchase: {
                            courseId,
                            orderId: transactionId,
                            amount,
                            currency: 'inr',
                            status: 'succeeded',
                            createdAt: new Date(),
                        },
                    },
                }, { upsert: true, new: true, session })
                    .session(session);
                if (!updatedPurchase) {
                    console.error("updateEnrollment error: Failed to update purchase record");
                    throw new custom_error_1.CustomError('Failed to update enrollment in database', constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
                }
                console.log("updateEnrollment database update result:", updatedPurchase);
                yield session.commitTransaction();
            }
            catch (error) {
                console.error("updateEnrollment database error:", error);
                yield session.abortTransaction();
                if (error instanceof custom_error_1.CustomError)
                    throw error;
                throw new custom_error_1.CustomError('Failed to update enrollment in database', constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR);
            }
            finally {
                session.endSession();
            }
        });
    }
}
exports.PaymentService = PaymentService;
exports.paymentService = new PaymentService();
