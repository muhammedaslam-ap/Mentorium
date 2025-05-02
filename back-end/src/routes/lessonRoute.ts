import { Request, Response, Router } from 'express';
import {
  userAuthMiddleware,
  authorizeRole,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { lessonVideoUploadMiddleware } from '../middlewares/S3.uploader';
import { lessonController } from '../di/lessonInjection';




export class LessonRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    // Add lesson
    this.router.post(
      '/courses/:courseId/lessons',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      lessonVideoUploadMiddleware,
      (req: Request, res: Response) =>
        lessonController.addLesson(req as CustomRequest, res)
    );

    this.router.get(
      '/lessons/:lessonId',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        lessonController.getLesson(req as CustomRequest, res)
    );

    // Get lessons by course ID
    this.router.get(
      '/courses/:courseId/lessons',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        lessonController.getLessonsByCourse(req as CustomRequest, res)
    );

    // Update lesson
    this.router.put(
      '/lessons/:lessonId',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      lessonVideoUploadMiddleware,
      (req: Request, res: Response) =>
        lessonController.updateLesson(req as CustomRequest, res)
    );

    // Delete lesson
    this.router.delete(
      '/lessons/:lessonId',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        lessonController.deleteLesson(req as CustomRequest, res)
    );
  }
}

export default new LessonRoutes().router;