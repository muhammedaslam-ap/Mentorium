import { Request, Response, Router } from 'express';
import {
  userAuthMiddleware,
  authorizeRole,
  CustomRequest,
} from '../middlewares/userAuthMiddleware';
import { checkUserBlocked } from '../middlewares/checkUserBlocked';
import { injectedQuizController } from '../di/quizInjection';




export class QuizRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      '/lesson/:lessonId/quiz',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedQuizController.addQuiz(req as CustomRequest, res)
    );

    this.router.get(
      '/lesson/:quizId',
      userAuthMiddleware,
      authorizeRole(['tutor','student']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedQuizController.getQuiz(req as CustomRequest, res)
    );

    this.router.get(
      '/lesson/:lessonId/quizId',
      userAuthMiddleware,
      authorizeRole(['tutor','student']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedQuizController.getQuizByLesson(req as CustomRequest, res)
    );

    this.router.put(
      '/quiz/:quizId',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedQuizController.updateQuiz(req as CustomRequest, res)
    );

    this.router.delete(
      '/quiz/:quizId',
      userAuthMiddleware,
      authorizeRole(['tutor']),
      checkUserBlocked,
      (req: Request, res: Response) =>
        injectedQuizController.deleteQuiz(req as CustomRequest, res)
    );
  }
}

export default new QuizRoutes().router;