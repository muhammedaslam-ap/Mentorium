import { Request, Response } from "express";
import { CustomError } from "../utils/custom.error";
import {
  ERROR_MESSAGES,
  HTTP_STATUS,
  SUCCESS_MESSAGES,
} from "../shared/constant";
import { IAdminService } from "../interfaces/serviceInterface/IadminServices";
import { ITutorService } from "../interfaces/serviceInterface/ItutorServices";

export class AdminController {
  constructor(private _adminService: IAdminService,
              private _tutorService:ITutorService
  ) {}

  async logoutAdmin(req: Request, res: Response) {
    try {
      res
        .clearCookie("adminAccessToken", {
          httpOnly: true,
          secure: false,
          sameSite: "lax",
        })
        .status(200)
        .json({ message: "Logout successful" });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ error: error.message });
        return;
      }
      console.log(error);
      res
        .status(HTTP_STATUS.INTERNAL_SERVER_ERROR)
        .json({ success: false, message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async acceptTutor(req: Request, res: Response) {
    try {
      const { tutorId } = req.params;
      if (!tutorId) {
        res
          .status(HTTP_STATUS.BAD_REQUEST)
          .json({ success: false, message: ERROR_MESSAGES.ID_NOT_PROVIDED });
          return
      }
      await this._adminService.acceptTutor(tutorId);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
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

  async rejectTutor(req: Request, res: Response) {
    try {
      const { tutorId } = req.params;
      const { reason } = req.body;

      console.log(`ID:${tutorId} , reason:${reason}`);
      await this._adminService.updateRejectedReason(tutorId.toString(), reason);
      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
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

  async usersList(req: Request, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const pageSize = parseInt(req.query.limit as string) || 10;
      const search = req.query.search as string | undefined;
      const role = req.query.role as string | undefined;
      const result = await this._adminService.usersList({
        page,
        pageSize,
        search,
        role,
      });
      res.status(200).json(result);
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




  async getDocumentPresignedUrl(req: Request, res: Response): Promise<void> {
    try {
      const tutorId = req.params.tutorId; 
      console.log(`Generating pre-signed URL for tutorId: ${tutorId}`);

     const profile = await this._tutorService.getTutorProfile(tutorId);

      if (!profile || !profile.verificationDocUrl) {
        console.log(`No document found for tutorId: ${tutorId}`);
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      const urlParts = profile.verificationDocUrl.split('/');
      const key = urlParts.slice(3).join('/');
      console.log(`Generating pre-signed URL for key: ${key}`);

      const presignedUrl = await this._tutorService.getPresignedUrl(key);
      console.log(`Pre-signed URL generated: ${presignedUrl}`);
      res.status(HTTP_STATUS.OK).json({ url: presignedUrl, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error("Error generating pre-signed URL:", error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }


  async updateStatus(req: Request, res: Response) {
    try {
      const { id } = req.params;
      const { status } = req.body;

      await this._adminService.updateStatus(id, status);

      res.status(HTTP_STATUS.OK).json({
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
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
