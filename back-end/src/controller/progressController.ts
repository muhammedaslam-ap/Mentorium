import { Request, Response } from "express";
import { IProgressService } from "../interfaces/serviceInterface/IprogressServices";
import { CustomError } from "../utils/custom.error";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constant";
import { CustomRequest } from "../middlewares/adminAuthMiddleware";

export class ProgressController {
  constructor(private _progressService: IProgressService) {}

  async markLessonCompleted(req: Request, res: Response) {
    try {
      const user = (req as CustomRequest).user;
      const { lessonId } = req.params;
      const { courseId } = req.body;

      await this._progressService.markLessonCompleted(
        user!.id,
        courseId,
        lessonId
      );
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

  async getCompletedLessons(req:Request,res:Response){
     try {
      const {courseId} = req.params;
       const user = (req as CustomRequest).user;
      const lessons =await this._progressService.getCompletedLessons(user!.id,courseId);
        res.status(HTTP_STATUS.OK).json({
          success: true,
          message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
          lessons
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
}
