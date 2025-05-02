import { Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { TLessonInput } from '../types/lesson';
import { MulterS3File } from '../types/multer';
import { LessonService } from '../services/lessonServices';

export class LessonController {
  constructor(private lessonService: LessonService) {}

  async addLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { title, courseId, description, duration, order } = req.body;
      console.log('addLesson - Request body:', { title, courseId, description, duration, order });
      console.log('addLesson - Request file:', req.file);

      if (!tutorId) {
        console.error('addLesson - No tutor ID found');
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
        return;
      }
      if (!req.file) {
        console.error('addLesson - No video file uploaded');
        res.status(400).json({ message: 'Video file is required' });
        return;
      }
      if (!title || !courseId || !description) {
        console.error('addLesson - Missing required fields');
        res.status(400).json({ message: 'Title, courseId, and description are required' });
        return;
      }

      const lessonData: TLessonInput = {
        title,
        courseId,
        description,
        file: '', // Will be set in LessonService
        duration: duration ? Number(duration) : undefined,
        order: order ? Number(order) : undefined,
      };

      const lesson = await this.lessonService.addLesson(tutorId, lessonData, req.file as MulterS3File);
      console.log(`Lesson added for courseId: ${courseId}`);
      res.status(201).json({ message: 'Lesson added successfully', lesson });
    } catch (error: any) {
      console.error('Error adding lesson:', error.message);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  async getLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const lessonId = req.params.lessonId;
      console.log(`getLesson - Fetching lesson with ID: ${lessonId}`);
      const lesson = await this.lessonService.getLessonById(lessonId);

      if (!lesson) {
        console.log(`Lesson not found: ${lessonId}`);
        res.status(404).json({ message: 'Lesson not found' });
        return;
      }

      console.log(`Lesson fetched:`, lesson);
      res.status(200).json({ lesson });
    } catch (error: any) {
      console.error('Error fetching lesson:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getLessonsByCourse(req: CustomRequest, res: Response): Promise<void> {
    try {
      const courseId = req.params.courseId;
      console.log(`getLessonsByCourse - Fetching lessons for courseId: ${courseId}`);
      const lessons = await this.lessonService.getLessonsByCourseId(courseId);

      console.log(`Lessons fetched for courseId: ${courseId}`, lessons);
      res.status(200).json({ lessons });
    } catch (error: any) {
      console.error('Error fetching lessons:', error.message);
      res.status(500).json({ message: 'Internal server error' });
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
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
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
      res.status(200).json({ message: 'Lesson updated successfully', lesson });
    } catch (error: any) {
      console.error('Error updating lesson:', error.message);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  async deleteLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const lessonId = req.params.lessonId;
      console.log(`deleteLesson - Deleting lesson with ID: ${lessonId}`);

      if (!tutorId) {
        console.error('deleteLesson - No tutor ID found');
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
        return;
      }

      await this.lessonService.deleteLesson(tutorId, lessonId);
      console.log(`Lesson deleted: ${lessonId}`);
      res.status(200).json({ message: 'Lesson deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting lesson:', error.message);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}