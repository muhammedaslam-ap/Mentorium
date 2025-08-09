import { Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { TLessonInput } from '../types/lesson';
import { MulterS3File } from '../types/multer';
import { LessonService } from '../services/lessonServices';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../shared/constant'
import { ILessonService } from '../interfaces/serviceInterface/IlessonServices';

export class LessonController {
  constructor(private lessonService: ILessonService) {}

  async addLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { title, courseId, description, duration, order } = req.body;
      console.log('addLesson - Request body:', { title, courseId, description, duration, order });
      console.log('addLesson - Request file:', req.file);

      if (!tutorId) {
        console.error('addLesson - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }
      if (!req.file) {
        console.error('addLesson - No video file uploaded');
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.MISSING_PARAMETERS });
        return;
      }
      if (!title || !courseId || !description) {
        console.error('addLesson - Missing required fields');
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.INCOMPLETE_INFO });
        return;
      }

      const lessonData: TLessonInput = {
        title,
        courseId,
        description,
        file: '',
        duration: duration ? Number(duration) : undefined,
        order: order ? Number(order) : undefined,
      };

      const lesson = await this.lessonService.addLesson(tutorId, lessonData, req.file as MulterS3File);
      console.log(`Lesson added for courseId: ${courseId}`);
      res.status(HTTP_STATUS.CREATED).json({ message: SUCCESS_MESSAGES.CREATED, lesson });
    } catch (error: any) {
      console.error('Error adding lesson:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const lessonId = req.params.lessonId;
      console.log(`getLesson - Fetching lesson with ID: ${lessonId}`);
      const lesson = await this.lessonService.getLessonById(lessonId);

      if (!lesson) {
        console.log(`Lesson not found: ${lessonId}`);
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      console.log(`Lesson fetched:`, lesson);
      res.status(HTTP_STATUS.OK).json({ lesson, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error('Error fetching lesson:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getLessonsByCourse(req: CustomRequest, res: Response): Promise<void> {
    try {
      const courseId = req.params.courseId;
      console.log(`getLessonsByCourse - Fetching lessons for courseId: ${courseId}`);
      const lessons = await this.lessonService.getLessonsByCourseId(courseId);

      console.log(`Lessons fetched for courseId: ${courseId}`, lessons);
      res.status(HTTP_STATUS.OK).json({ lessons, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error('Error fetching lessons:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async updateLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const lessonId = req.params.lessonId;
      const { title, description, duration, order } = req.body;
      console.log('updateLesson - Request body:', { title, description, duration, order });
      console.log('updateLesson - Request file:', req.file);

      if (!tutorId) {
        console.error('updateLesson - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      const lessonData: Partial<TLessonInput> = {
        title,
        description,
        duration: duration ? Number(duration) : undefined,
        order: order ? Number(order) : undefined,
      };

      const lesson = await this.lessonService.updateLesson(tutorId, lessonId, lessonData, req.file as MulterS3File);
      console.log(`Lesson updated: ${lessonId}`);
      res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.UPDATE_SUCCESS, lesson });
    } catch (error: any) {
      console.error('Error updating lesson:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async deleteLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const lessonId = req.params.lessonId;
      console.log(`deleteLesson - Deleting lesson with ID: ${lessonId}`);

      if (!tutorId) {
        console.error('deleteLesson - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      await this.lessonService.deleteLesson(tutorId, lessonId);
      console.log(`Lesson deleted: ${lessonId}`);
      res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.DELETE_SUCCESS });
    } catch (error: any) {
      console.error('Error deleting lesson:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}