import { Request, Response, Router } from 'express';
import Stripe from 'stripe';
import { paymentService } from '../services/paymentService';
import { userAuthMiddleware } from '../middlewares/userAuthMiddleware';
import { CustomError } from '../utils/custom.error';
import { HTTP_STATUS } from '../shared/constant';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import mongoose from 'mongoose';
import { WalletModel } from '../models/walletModel';
import { purchaseModel } from '../models/buyCourseModal';
import { TransactionModel } from '../models/transactionModel';
import { ICourseService } from '../interfaces/serviceInterface/IcourseServices';
import { CourseService } from '../services/courseServices';
import { CourseRepository } from '../repositories/courseRepository';
import { courseModel } from '../models/course';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2025-04-30.basil',
});

export class PaymentRoutes {
  public router: Router;

  constructor(private _courseService: ICourseService = new CourseService(new CourseRepository())) {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/stripe/create-payment-intent',
      userAuthMiddleware,
      async (req: Request, res: Response) => {
        try {
          const { amount, currency, courseId } = req.body;
          const user = (req as CustomRequest).user;

          const userId = user?.id;

          if (!userId) {
            throw new CustomError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
          }

          if (!amount || !currency || !courseId) {
            throw new CustomError('Missing required fields', HTTP_STATUS.BAD_REQUEST);
          }

          console.log("Creating PaymentIntent:", { amount, currency, courseId, userId });

          const paymentIntent = await stripe.paymentIntents.create({
            amount: amount, // Amount in paise
            currency,
            metadata: { courseId, userId },
            payment_method_types: ['card'],
            description: `Course purchase: ${courseId} by user ${userId}`,
            shipping: {
              name: user?.name || 'Customer Name', 
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

          await paymentService.createStripePayment(
            paymentIntent.id,
            amount / 100, // Convert paise to rupees for storage
            currency,
            courseId,
            userId
          );

          res.json({ clientSecret: paymentIntent.client_secret });
        } catch (error: any) {
          console.error('Error creating PaymentIntent:', error);
          if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
          } else {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
          }
        }
      }
    );

    // Update Stripe Payment Status
    this.router.post(
      '/stripe',
      userAuthMiddleware,
      async (req: Request, res: Response) => {
        try {
          const { paymentIntentId, status } = req.body;
          const user = (req as CustomRequest).user;

          const userId = user?.id;

          if (!userId) {
            throw new CustomError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
          }

          if (!paymentIntentId || !status) {
            throw new CustomError('Missing required fields', HTTP_STATUS.BAD_REQUEST);
          }

          await paymentService.updateStripePayment(paymentIntentId, status, userId);
          if (status === 'succeeded') {
            await paymentService.stripePayment(paymentIntentId, userId);
          }
          res.json({ success: true });
        } catch (error: any) {
          console.error('Error updating Stripe payment:', error);
          if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
          } else {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: error.message });
          }
        }
      }
    );

    this.router.post(
      '/enrollment',
      userAuthMiddleware,
      async (req: Request, res: Response) => {
        const session = await mongoose.startSession();
        session.startTransaction();
        try {
          const { courseId, paymentIntentId, amount } = req.body;
          const user = (req as CustomRequest).user;

          const userId = user?.id;

          if (!userId) {
            throw new CustomError('User not authenticated', HTTP_STATUS.UNAUTHORIZED);
          }

          if (!courseId || !paymentIntentId || !amount) {
            console.log('Missing fields:', { courseId, paymentIntentId, amount });
            throw new CustomError('Missing required fields', HTTP_STATUS.BAD_REQUEST);
          }

          console.log("Updating enrollment for:", { userId, paymentIntentId, courseId, amount });

          // Update enrollment
          await paymentService.updateEnrollment(courseId, paymentIntentId, amount, userId);

          // Find the Purchase document using the paymentIntentId
          const purchase = await purchaseModel
            .findOne({
              userId,
              'purchase.orderId': paymentIntentId,
            })
            .session(session);

          if (!purchase) {
            throw new CustomError('Purchase not found for the given paymentIntentId', HTTP_STATUS.BAD_REQUEST);
          }

          // Get the purchase document's _id
          const purchaseId = purchase._id;
          
          const courseID = await courseModel.findById(courseId);
            if (!courseID || !courseID.title) {
              throw new CustomError('Tutor not found for this course', HTTP_STATUS.NOT_FOUND);
            }

          
          // Fetch course to get tutorId
          const course = await this._courseService.getCourseDetails(courseId);
          if (!course || !course.tutorId) {
            throw new CustomError('Course or tutor not found', HTTP_STATUS.BAD_REQUEST);
          }
          const tutorId = course.tutorId;

          // Tutor Wallet Update
          let tutorWallet = await WalletModel.findOne({
            userId: tutorId,
          }).session(session);
          if (!tutorWallet) {
            tutorWallet = new WalletModel({
              userId: tutorId,
              balance: 0,
            });
            await tutorWallet.save({ session });
          }
          // tutorWallet.balance += amount;
          await tutorWallet.save({ session });

          // Tutor Transaction
          const tutorTransaction = new TransactionModel({
            transactionId: `txn_tutor_${Date.now()}`,
            wallet_id: tutorWallet._id,
            purchase_id: purchaseId,
            transaction_type: 'credit',
            amount: amount,
            description: `Payment for course purchase (Course ID: ${courseID.title})`,
          });
          await tutorTransaction.save({ session });

          // Commit the transaction
          await session.commitTransaction();
          res.json({ success: true });
        } catch (error: any) {
          await session.abortTransaction();
          console.error('Error updating enrollment or transaction:', error);
          if (error instanceof CustomError) {
            res.status(error.statusCode).json({ error: error.message });
          } else {
            res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ error: 'An unexpected error occurred' });
          }
        } finally {
          session.endSession();
        }
      }
    );
  }
}

export default new PaymentRoutes().router;