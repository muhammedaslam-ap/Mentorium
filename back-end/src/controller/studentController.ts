import { Response } from "express";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { IStudentService } from "../interfaces/serviceInterface/IstudentServices";
import { IStudentProfile } from "../types/student";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constant";

export class StudentController {
  constructor(private studentService: IStudentService) {}

  async addStudentProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user?.id;
      const { aboutMe, education, interests } = req.body;
      console.log("addStudentProfile - studentId:", studentId, "body:", req.body);

      if (!studentId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      if (!aboutMe || !education || !interests ) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.VALIDATION_ERROR });
        return;
      }

      const profileData: IStudentProfile = {
        studentId,
        aboutMe,
        education,
        interests,
      };

      await this.studentService.addStudentProfile(studentId, profileData);
      res.status(HTTP_STATUS.CREATED).json({ message: SUCCESS_MESSAGES.CREATED });
    } catch (error) {
      console.error("Error adding student profile:", error);
      const message =
        error instanceof Error && error.message === ERROR_MESSAGES.EMAIL_EXISTS
          ? error.message
          : ERROR_MESSAGES.SERVER_ERROR;
      const status =
        message === ERROR_MESSAGES.EMAIL_EXISTS
          ? HTTP_STATUS.BAD_REQUEST
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ message });
    }
  }

  async getStudentProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user?.id;
      console.log("getStudentProfile - studentId:", studentId);

      if (!studentId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTHORIZED_ACCESS });
        return;
      }

      const profile = await this.studentService.getStudentProfile(studentId);
      if (!profile) {
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS, profile });
    } catch (error) {
      console.error("Error fetching student profile:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async updateStudentProfile(req: CustomRequest, res: Response): Promise<void> {
    try {
      const studentId = req.user?.id;
      const { aboutMe, education, interests } = req.body;
      console.log("updateStudentProfile - studentId:", studentId, "body:", req.body);

      if (!studentId) {
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      if (!aboutMe && !education && (!interests || !Array.isArray(interests))) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.VALIDATION_ERROR });
        return;
      }

      const profileData: Partial<IStudentProfile> = {
        studentId,
        ...(aboutMe && { aboutMe }),
        ...(education && { education }),
        ...(interests && Array.isArray(interests) && { interests }),
      };

      await this.studentService.updateStudentProfile(studentId, profileData as IStudentProfile);
      res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.UPDATE_SUCCESS });
    } catch (error) {
      console.error("Error updating student profile:", error);
      const message =
        error instanceof Error && error.message === ERROR_MESSAGES.USER_NOT_FOUND
          ? error.message
          : ERROR_MESSAGES.SERVER_ERROR;
      const status =
        message === ERROR_MESSAGES.USER_NOT_FOUND
          ? HTTP_STATUS.NOT_FOUND
          : HTTP_STATUS.INTERNAL_SERVER_ERROR;
      res.status(status).json({ message });
    }
  }


  async  studentDetails(req:CustomRequest,res:Response): Promise<void> {
    try {
        const studentId = req.user?.id;
        console.log("addStudentProfile - studentId:", studentId);
        if (!studentId) {
          res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
          return;
        }

        const details = await this.studentService.getStudentDetails(studentId);
        if (!details) {
          res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
          return;
        }
  
        res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS, details });
        
    }  catch (error) {
        console.error("Error fetching student profile:", error);
        res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
      }
  }
}