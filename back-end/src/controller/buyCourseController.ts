import { Request, Response } from "express";
import { IPurchaseService } from "../interfaces/serviceInterface/IbuyCourseServices";
import { CustomError } from "../utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { createSecureUrl } from "../utils/cloudinaryURL";

export class PurchaseController {
  constructor(private _purchaseService: IPurchaseService) {}

  async saveOrder(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      const data = req.body;
      console.log("DATA IN BACKEND", data);
      await this._purchaseService.saveOrder(user.id, data);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res
          .status(error.statusCode)
          .json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async checkEnrollment(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      console.log("here im---------------------------->",user)
      if (!user?.id) {
        throw new Error( ERROR_MESSAGES.UNAUTHORIZED_ACCESS);
      }

      const { courseId } = req.params;
      if (!courseId) {
        throw new Error( ERROR_MESSAGES.MISSING_PARAMETERS);
      }

      const isEnrolled = await this._purchaseService.checkEnrollment(user.id, courseId);
      console.log("finallyyyyyyy",isEnrolled)
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: isEnrolled ? "User is enrolled in the course" : "User is not enrolled in the course",
        data: { isEnrolled },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.error("Error in checkEnrollment:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

 async getEnrolledCourses(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
  
      const result = await this._purchaseService.getUserEnrolledCourses(user.id);

      const defaultThumbnail = "/uploads/default.jpg"; 
      const updatedCourses = result.courses
        ? await Promise.all(
            result.courses.map(async (course) => {
              try {
                const thumbnail = course.thumbnail || defaultThumbnail;
                console.log(`Processing thumbnail for course ${course._id}: ${thumbnail}`);
                const secureUrl = await createSecureUrl(thumbnail, "image");
                return {
                  ...course,
                  thumbnail: secureUrl || defaultThumbnail, 
                };
              } catch (error:any) {
                console.error(`Error creating secure URL for course ${course._id}: ${error.message}`);
                return {
                  ...course,
                  thumbnail: defaultThumbnail,
                };
              }
            })
          )
        : [];

      console.log("Updated courses with secure URLs:", JSON.stringify(updatedCourses, null, 2));
      res.status(HTTP_STATUS.OK).json({ courses: updatedCourses, total: result.total });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.error("Error getting enrolled courses:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
}
