import { Response } from "express";
import { CustomRequest } from "../middlewares/userAuthMiddleware";
import { CustomError } from "../utils/custom.error";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse } from "cloudinary";
import { ICourseService } from "../interfaces/serviceInterface/IcourseServices";
import { createSecureUrl } from "../utils/cloudinaryURL";
import { ERROR_MESSAGES, HTTP_STATUS, SUCCESS_MESSAGES } from "../shared/constant";
import { courseModel } from "../models/course";
import mongoose from "mongoose";

export class CourseController {
  constructor(private _courseService: ICourseService) {}

  async addCourse(req: CustomRequest, res: Response) {
    try {
      const tutor = req.user;
      let publicId: string = "";
      if (req.file) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
          {
            timestamp,
            folder: "course_thumbnails",
            access_mode: "authenticated",
          },
          process.env.CLOUDINARY_API_SECRET as string
        );

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "course_thumbnails",
              access_mode: "authenticated",
              timestamp,
              signature,
              api_key: process.env.CLOUDINARY_API_KEY as string,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            }
          );
          if (req.file) {
            stream.end(req.file.buffer);
          }          
        });

        publicId = (uploadResult as UploadApiResponse).public_id;
        console.log("Uploaded Secure Image Public ID:", publicId);
      }
      await this._courseService.addCourse(req.body, publicId, tutor?.id);
      res.status(HTTP_STATUS.CREATED).json({
        success: true,
        message: SUCCESS_MESSAGES.CREATED,
      });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async getCourseById(req: CustomRequest, res: Response): Promise<void> {
    try {
      const { courseId } = req.params; 
      const userId = req.user?.id;     

      if (!courseId || !userId) {
        res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.MISSING_PARAMETERS,
        });
        return;
      }

      const result = await this._courseService.getCourseById(courseId, userId);
      res.status(result.statusCode).json({
        success: result.success,
        message: result.message || SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        course: result.course,
      });
    } catch (error) {
      console.error("Error in getCourseById controller:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async getTutorCourses(req: CustomRequest, res: Response) {
    try {
      const tutor = req.user;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;

      const { courses, totalCourses } = await this._courseService.getTutorCourses(tutor.id, page, limit);

      const updatedCourses = courses
        ? await Promise.all(
            courses.map(async (course) => {
              if (course.thumbnail) {
                course.thumbnail = await createSecureUrl(course.thumbnail, "image");
              }
              return course;
            })
          )
        : [];

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        courses: updatedCourses,
        totalCourses,
      });
    } catch (error) {
      console.error("Error in getTutorCourses:", error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async updateCourse(req: CustomRequest, res: Response) {
    try {
      const { courseId } = req.params;
      let publicId: string = "";

      if (req.file) {
        const timestamp = Math.round(new Date().getTime() / 1000);
        const signature = cloudinary.utils.api_sign_request(
          {
            timestamp,
            folder: "course_thumbnails",
            access_mode: "authenticated",
          },
          process.env.CLOUDINARY_API_SECRET as string
        );

        const uploadResult = await new Promise((resolve, reject) => {
          const stream = cloudinary.uploader.upload_stream(
            {
              resource_type: "auto",
              folder: "course_thumbnails",
              access_mode: "authenticated",
              timestamp,
              signature,
              api_key: process.env.CLOUDINARY_API_KEY as string,
            },
            (error, result) => {
              if (error) return reject(error);
              resolve(result as UploadApiResponse);
            }
          );
          if (req.file) {
            stream.end(req.file.buffer);
          }
        });

        publicId = (uploadResult as UploadApiResponse).public_id;
      }

      await this._courseService.updateCourse(req.body, publicId, courseId.toString());
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.UPDATE_SUCCESS,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async deleteCourse(req: CustomRequest, res: Response) {
    try {
      const { courseId } = req.params;
      await this._courseService.deleteCourse(courseId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DELETE_SUCCESS,
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async getAllStudents(req: CustomRequest, res: Response) {
    try {
      const { courseId } = req.params;

      if (!courseId) {
        return res.status(HTTP_STATUS.BAD_REQUEST).json({
          success: false,
          message: ERROR_MESSAGES.MISSING_PARAMETERS,
        });
      }

      const students = await this._courseService.getAllStudents(courseId);
      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        students,
      });
    } catch (error) {
      console.error(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }

  async getAllCourses(req: CustomRequest, res: Response) {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const search = (req.query.search as string | undefined)?.trim() || "";
      const category = (req.query.category as string | undefined)?.trim() || "";
      const difficulty = (req.query.difficulty as string | undefined)?.trim() || "";
      const minPriceStr = req.query.minPrice as string | undefined;
      const maxPriceStr = req.query.maxPrice as string | undefined;
      const sort = (req.query.sort as string | undefined)?.trim() || "";

      const minPrice = minPriceStr ? parseInt(minPriceStr) : 0;
      const maxPrice = maxPriceStr ? parseInt(maxPriceStr) : 1500;

      if (isNaN(minPrice) || isNaN(maxPrice)) {
        throw new CustomError(ERROR_MESSAGES.INVALID_PRICE_RANGE, HTTP_STATUS.BAD_REQUEST);
      }

      if (minPrice < 0 || maxPrice < minPrice) {
        throw new CustomError(ERROR_MESSAGES.INVALID_PRICE_RANGE_VALUES, HTTP_STATUS.BAD_REQUEST);
      }

      const { courses, total } = await this._courseService.getAllCourses({
        page,
        limit,
        search,
        category,
        difficulty,
        minPrice,
        maxPrice,
        sort,
      });

      const updatedCourses = courses
        ? await Promise.all(
            courses.map(async (course) => {
              if (course.thumbnail) {
                course.thumbnail = await createSecureUrl(course.thumbnail, "image");
              }
              return course;
            })
          )
        : [];

      res.status(HTTP_STATUS.OK).json({
        success: true,
        message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS,
        courses: { courses: updatedCourses, total },
      });
    } catch (error) {
      if (error instanceof CustomError) {
        res.status(error.statusCode).json({ success: false, message: error.message });
        return;
      }
      console.log(error);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: ERROR_MESSAGES.SERVER_ERROR,
      });
    }
  }
}
