import mongoose, { isValidObjectId } from 'mongoose';
import Stripe from 'stripe';
import { purchaseModel } from '../models/buyCourseModal';
import { CustomError } from '../utils/custom.error';
import { HTTP_STATUS } from '../shared/constant';
import { courseModel } from '../models/course';
import { userModel } from '../models/userModel';
import { WalletModel } from '../models/walletModel';
 import { AdminWalletModel } from '../models/adminWallet'; 


interface PurchaseDetails {
  courseId: string;
  orderId: string;
  amount: number;
  currency: string;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: Date;
}

export class PaymentService {
  private stripe: Stripe;

  constructor() {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('STRIPE_SECRET_KEY is not defined');
    }

    this.stripe = new Stripe(process.env.STRIPE_SECRET_KEY, {
      apiVersion: '2025-04-30.basil',
    });
  }


async createStripePayment(
  paymentIntentId: string,
  amount: number,
  currency: string,
  courseId: string,
  userId: string
): Promise<void> {
  if (!isValidObjectId(courseId) || !isValidObjectId(userId)) {
    console.error("Validation error: Invalid courseId or userId", { courseId, userId });
    throw new CustomError('Invalid courseId or userId', HTTP_STATUS.BAD_REQUEST);
  }

  try {
    const course = await courseModel.findById(courseId);
    if (!course || !course.tutorId) {
      throw new CustomError('Tutor not found for this course', HTTP_STATUS.NOT_FOUND);
    }


    const tutor = await userModel.findById(course.tutorId);
    if (!tutor) {
      throw new CustomError('Tutor user not found', HTTP_STATUS.NOT_FOUND);
    }

    const tutorName = `${tutor.name}`; 
    const courseName = course.title || "Untitled Course"; 

    const tutorShare = amount * 0.9;
    const adminShare = amount * 0.1;

    await WalletModel.findOneAndUpdate(
      { userId: course.tutorId },
      { $inc: { balance: tutorShare } },
      { upsert: true, new: true }
    );

    const adminWallet = await AdminWalletModel.getWallet();
    const transactionId = `txn_${Date.now()}`;

    adminWallet.balance += adminShare;
      adminWallet.transactions.push({
      transactionId,
      purchase_id: new mongoose.Types.ObjectId(), 
      transaction_type: "credit",
      amount: adminShare,
      description: `10% commission from course "${courseName}" by tutor ${tutorName}`,
      transaction_date: new Date(),
    });


    await adminWallet.save();

    const existingPurchase = await purchaseModel.findOne({
      userId,
      'purchase.orderId': paymentIntentId,
    });

    if (existingPurchase) {
      console.log("Purchase already exists for paymentIntentId:", paymentIntentId);
      return;
    }

    await purchaseModel.findOneAndUpdate(
      { userId },
      {
        $push: {
          purchase: {
            courseId,
            orderId: paymentIntentId,
            amount,
            currency,
            status: 'pending',
            createdAt: new Date(),
          } as PurchaseDetails,
        },
      },
      { upsert: true }
    );

    console.log("Payment recorded successfully.");
  } catch (error) {
    console.error("Error in createStripePayment:", error);
    throw new CustomError(
      'Failed to process Stripe payment',
      HTTP_STATUS.INTERNAL_SERVER_ERROR
    );
  }
}



  async updateStripePayment(
    paymentIntentId: string,
    status: 'succeeded' | 'failed',
    userId: string
  ): Promise<void> {
    console.log("updateStripePayment called", { paymentIntentId, status, userId });

    if (!isValidObjectId(userId)) {
      console.error("Validation error: Invalid userId", { userId });
      throw new CustomError('Invalid userId', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const updatedPurchase = await purchaseModel.findOneAndUpdate(
        { userId, 'purchase.orderId': paymentIntentId },
        { $set: { 'purchase.$.status': status } },
        { new: true }
      );

      if (!updatedPurchase) {
        console.error("updateStripePayment error: Payment record not found", { userId, paymentIntentId });
        throw new CustomError(
          'Payment record not found for the given user and paymentIntentId',
          HTTP_STATUS.NOT_FOUND
        );
      }
      console.log("updateStripePayment database update result:", updatedPurchase);
    } catch (error) {
      console.error("updateStripePayment database error:", error);
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Failed to update payment status in database',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async stripePayment(paymentIntentId: string, userId: string): Promise<void> {
    console.log("stripePayment called", { paymentIntentId, userId });

    if (!isValidObjectId(userId)) {
      console.error("Validation error: Invalid userId", { userId });
      throw new CustomError('Invalid userId', HTTP_STATUS.BAD_REQUEST);
    }

    try {
      const paymentIntent = await this.stripe.paymentIntents.retrieve(paymentIntentId);

      if (paymentIntent.status !== 'succeeded') {
        console.error("stripePayment error: Payment not successful", { paymentIntent });
        throw new CustomError('Payment not successful', HTTP_STATUS.BAD_REQUEST);
      }

      const updatedPurchase = await purchaseModel.findOneAndUpdate(
        { userId, 'purchase.orderId': paymentIntentId },
        { $set: { 'purchase.$.status': 'succeeded' } },
        { new: true }
      );

      if (!updatedPurchase) {
        console.error("stripePayment error: Payment record not found", { userId, paymentIntentId });
        throw new CustomError(
          'Payment record not found for the given user and paymentIntentId',
          HTTP_STATUS.NOT_FOUND
        );
      }
      console.log("stripePayment database update result:", updatedPurchase);
    } catch (error) {
      console.error("stripePayment error:", error);
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Failed to verify and update payment status',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    }
  }

  async updateEnrollment(
    courseId: string,
    transactionId: string,
    amount: number,
    userId: string
  ): Promise<void> {
    console.log("updateEnrollment called", { courseId, transactionId, amount, userId });

    if (!isValidObjectId(courseId) || !isValidObjectId(userId)) {
      console.error("Validation error: Invalid courseId or userId", { courseId, userId });
      throw new CustomError('Invalid courseId or userId', HTTP_STATUS.BAD_REQUEST);
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
      console.log("Checking for existing purchase", { userId, transactionId });
      const existingPurchase = await purchaseModel
        .findOne({
          userId,
          'purchase.orderId': transactionId,
        })
        .session(session);

      if (existingPurchase) {
        console.log("Purchase already exists for transactionId:", transactionId);
        await session.commitTransaction();
        return;
      }

      console.log("Adding purchase to database with status 'succeeded'");
      const updatedPurchase = await purchaseModel
        .findOneAndUpdate(
          { userId },
          {
            $push: {
              purchase: {
                courseId,
                orderId: transactionId,
                amount,
                currency: 'inr',
                status: 'succeeded',
                createdAt: new Date(),
              } as PurchaseDetails,
            },
          },
          { upsert: true, new: true, session }
        )
        .session(session);

      if (!updatedPurchase) {
        console.error("updateEnrollment error: Failed to update purchase record");
        throw new CustomError(
          'Failed to update enrollment in database',
          HTTP_STATUS.INTERNAL_SERVER_ERROR
        );
      }
      console.log("updateEnrollment database update result:", updatedPurchase);

      await session.commitTransaction();
    } catch (error) {
      console.error("updateEnrollment database error:", error);
      await session.abortTransaction();
      if (error instanceof CustomError) throw error;
      throw new CustomError(
        'Failed to update enrollment in database',
        HTTP_STATUS.INTERNAL_SERVER_ERROR
      );
    } finally {
      session.endSession();
    }
  }
}

export const paymentService = new PaymentService();