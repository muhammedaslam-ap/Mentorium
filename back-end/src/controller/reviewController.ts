import { Request, Response } from "express";
import { IReviewService } from "../interfaces/serviceInterface/IreviewServices";
import { CustomRequest } from "../middlewares/adminAuthMiddleware";
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from "../shared/constant";
import { CustomError } from "../utils/custom.error";
import mongoose from "mongoose";

export class ReviewController {
  constructor(private _reviewService: IReviewService) {}

  async addReview(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      const { courseId, rating, comment } = req.body;

      console.log("IN CONTROLLER REVIEW ADDING", req.body);

      const data = await this._reviewService.addReview({
        course_id: courseId,
        user_id: user!.id,
        rating,
        comment,
      });

      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async getReviewsByCourse(req: Request, res: Response) {
    try {
      const { courseId } = req.params;
      const reviews = await this._reviewService.getReviewsForCourse(courseId);

      console.log("Backend Review", reviews);

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        reviews,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        return res.status(error.statusCode).json({ success: false, message: error.message });
      }
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
}
