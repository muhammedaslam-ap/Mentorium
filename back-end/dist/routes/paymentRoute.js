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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.PaymentRoutes = void 0;
const express_1 = require("express");
const stripe_1 = __importDefault(require("stripe"));
const paymentService_1 = require("../services/paymentService");
const userAuthMiddleware_1 = require("../middlewares/userAuthMiddleware");
const custom_error_1 = require("../utils/custom.error");
const constant_1 = require("../shared/constant");
const mongoose_1 = __importDefault(require("mongoose"));
const walletModel_1 = require("../models/walletModel");
const buyCourseModal_1 = require("../models/buyCourseModal");
const transactionModel_1 = require("../models/transactionModel");
const courseServices_1 = require("../services/courseServices");
const courseRepository_1 = require("../repositories/courseRepository");
const course_1 = require("../models/course");
const stripe = new stripe_1.default(process.env.STRIPE_SECRET_KEY, {
    apiVersion: '2025-04-30.basil',
});
class PaymentRoutes {
    constructor(_courseService = new courseServices_1.CourseService(new courseRepository_1.CourseRepository())) {
        this._courseService = _courseService;
        this.router = (0, express_1.Router)();
        this.initializeRoutes();
    }
    initializeRoutes() {
        this.router.post('/stripe/create-payment-intent', userAuthMiddleware_1.userAuthMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { amount, currency, courseId } = req.body;
                const user = req.user;
                const userId = user === null || user === void 0 ? void 0 : user.id;
                if (!userId) {
                    throw new custom_error_1.CustomError('User not authenticated', constant_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!amount || !currency || !courseId) {
                    throw new custom_error_1.CustomError('Missing required fields', constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                console.log("Creating PaymentIntent:", { amount, currency, courseId, userId });
                const paymentIntent = yield stripe.paymentIntents.create({
                    amount: amount, // Amount in paise
                    currency,
                    metadata: { courseId, userId },
                    payment_method_types: ['card'],
                    description: `Course purchase: ${courseId} by user ${userId}`,
                    shipping: {
                        name: (user === null || user === void 0 ? void 0 : user.name) || 'Customer Name',
                        address: {
                            line1: '123 Street',
                            city: 'Mumbai',
                            state: 'Maharashtra',
                            country: 'IN',
                            postal_code: '400001',
                        },
                    },
                });
                console.log("PaymentIntent created successfully:", {
                    id: paymentIntent.id,
                    description: paymentIntent.description,
                    shipping: paymentIntent.shipping,
                    amount: paymentIntent.amount,
                    currency: paymentIntent.currency,
                });
                yield paymentService_1.paymentService.createStripePayment(paymentIntent.id, amount / 100, // Convert paise to rupees for storage
                currency, courseId, userId);
                res.json({ clientSecret: paymentIntent.client_secret });
            }
            catch (error) {
                console.error('Error creating PaymentIntent:', error);
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ error: error.message });
                }
                else {
                    res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
                }
            }
        }));
        // Update Stripe Payment Status
        this.router.post('/stripe', userAuthMiddleware_1.userAuthMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
            try {
                const { paymentIntentId, status } = req.body;
                const user = req.user;
                const userId = user === null || user === void 0 ? void 0 : user.id;
                if (!userId) {
                    throw new custom_error_1.CustomError('User not authenticated', constant_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!paymentIntentId || !status) {
                    throw new custom_error_1.CustomError('Missing required fields', constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                yield paymentService_1.paymentService.updateStripePayment(paymentIntentId, status, userId);
                if (status === 'succeeded') {
                    yield paymentService_1.paymentService.stripePayment(paymentIntentId, userId);
                }
                res.json({ success: true });
            }
            catch (error) {
                console.error('Error updating Stripe payment:', error);
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ error: error.message });
                }
                else {
                    res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
                }
            }
        }));
        this.router.post('/enrollment', userAuthMiddleware_1.userAuthMiddleware, (req, res) => __awaiter(this, void 0, void 0, function* () {
            const session = yield mongoose_1.default.startSession();
            session.startTransaction();
            try {
                const { courseId, paymentIntentId, amount } = req.body;
                const user = req.user;
                const userId = user === null || user === void 0 ? void 0 : user.id;
                if (!userId) {
                    throw new custom_error_1.CustomError('User not authenticated', constant_1.HTTP_STATUS.UNAUTHORIZED);
                }
                if (!courseId || !paymentIntentId || !amount) {
                    console.log('Missing fields:', { courseId, paymentIntentId, amount });
                    throw new custom_error_1.CustomError('Missing required fields', constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                console.log("Updating enrollment for:", { userId, paymentIntentId, courseId, amount });
                // Update enrollment
                yield paymentService_1.paymentService.updateEnrollment(courseId, paymentIntentId, amount, userId);
                // Find the Purchase document using the paymentIntentId
                const purchase = yield buyCourseModal_1.purchaseModel
                    .findOne({
                    userId,
                    'purchase.orderId': paymentIntentId,
                })
                    .session(session);
                if (!purchase) {
                    throw new custom_error_1.CustomError('Purchase not found for the given paymentIntentId', constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                // Get the purchase document's _id
                const purchaseId = purchase._id;
                const courseID = yield course_1.courseModel.findById(courseId);
                if (!courseID || !courseID.title) {
                    throw new custom_error_1.CustomError('Tutor not found for this course', constant_1.HTTP_STATUS.NOT_FOUND);
                }
                // Fetch course to get tutorId
                const course = yield this._courseService.getCourseDetails(courseId);
                if (!course || !course.tutorId) {
                    throw new custom_error_1.CustomError('Course or tutor not found', constant_1.HTTP_STATUS.BAD_REQUEST);
                }
                const tutorId = course.tutorId;
                // Tutor Wallet Update
                let tutorWallet = yield walletModel_1.WalletModel.findOne({
                    userId: tutorId,
                }).session(session);
                if (!tutorWallet) {
                    tutorWallet = new walletModel_1.WalletModel({
                        userId: tutorId,
                        balance: 0,
                    });
                    yield tutorWallet.save({ session });
                }
                // tutorWallet.balance += amount;
                yield tutorWallet.save({ session });
                // Tutor Transaction
                const tutorTransaction = new transactionModel_1.TransactionModel({
                    transactionId: `txn_tutor_${Date.now()}`,
                    wallet_id: tutorWallet._id,
                    purchase_id: purchaseId,
                    transaction_type: 'credit',
                    amount: amount,
                    description: `Payment for course purchase (Course ID: ${courseID.title})`,
                });
                yield tutorTransaction.save({ session });
                // Commit the transaction
                yield session.commitTransaction();
                res.json({ success: true });
            }
            catch (error) {
                yield session.abortTransaction();
                console.error('Error updating enrollment or transaction:', error);
                if (error instanceof custom_error_1.CustomError) {
                    res.status(error.statusCode).json({ error: error.message });
                }
                else {
                    res.status(constant_1.HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'An unexpected error occurred' });
                }
            }
            finally {
                session.endSession();
            }
        }));
    }
}
exports.PaymentRoutes = PaymentRoutes;
exports.default = new PaymentRoutes().router;
