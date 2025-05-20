import { Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { TquizInput } from '../types/quiz';
import { IquizService } from '../interfaces/serviceInterface/IquizServices';
import { HTTP_STATUS, SUCCESS_MESSAGES, ERROR_MESSAGES } from '../shared/constant';

export class QuizController {
  constructor(private quizService: IquizService) {}

  async addQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { question, answer, lesson_id, options } = req.body;
      console.log('addQuiz - Request body:', { question, answer, lesson_id, options });

      if (!tutorId) {
        console.error('addQuiz - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      if (!lesson_id) {
        console.error('addQuiz - Missing required field lesson_id');
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.INCOMPLETE_INFO });
        return;
      }

      if (!question || !answer || !options) {
        console.error('addQuiz - Missing required fields');
        res.status(HTTP_STATUS.BAD_REQUEST).json({ message: ERROR_MESSAGES.INCOMPLETE_INFO });
        return;
      }

      const quizData: TquizInput = {
        answer,
        lesson_id,
        options,
        question,
      };

      const quiz = await this.quizService.addQuiz(tutorId, quizData);
      console.log(`Quiz added for lesson: ${lesson_id}`);
      res.status(HTTP_STATUS.CREATED).json({ message: SUCCESS_MESSAGES.CREATED, quiz });
    } catch (error: any) {
      console.error('Error adding quiz:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const quizId = req.params.quizId;
      console.log(`getQuiz - Fetching quiz with ID: ${quizId}`);
      const quiz = await this.quizService.getQuizById(quizId);

      if (!quiz) {
        console.log(`Quiz not found: ${quizId}`);
        res.status(HTTP_STATUS.NOT_FOUND).json({ message: ERROR_MESSAGES.USER_NOT_FOUND });
        return;
      }

      console.log(`Quiz fetched:`, quiz);
      res.status(HTTP_STATUS.OK).json({ quiz, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error('Error fetching quiz:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async getQuizByLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const lessonId = req.params.lessonId;
      console.log(`getQuizByLesson - Fetching quiz for lessonId: ${lessonId}`);
      const quiz = await this.quizService.getQuizByLessonId(lessonId);

      console.log(`Quiz fetched for lessonId: ${lessonId}`, quiz);
      res.status(HTTP_STATUS.OK).json({ quiz, message: SUCCESS_MESSAGES.DATA_RETRIEVED_SUCCESS });
    } catch (error: any) {
      console.error('Error fetching quiz:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async updateQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const quizId = req.params.quizId;
      const { answer, lesson_id, options, question } = req.body;
      console.log('updateQuiz - Request body:', { answer, lesson_id, options, question });

      if (!tutorId) {
        console.error('updateQuiz - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      const quizData: Partial<TquizInput> = {
        answer,
        lesson_id,
        options,
        question,
      };

      const quiz = await this.quizService.updateQuiz(tutorId, quizId, quizData);
      console.log(`Quiz updated: ${quizId}`);
      res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.UPDATE_SUCCESS, quiz });
    } catch (error: any) {
      console.error('Error updating quiz:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }

  async deleteQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const quizId = req.params.quizId;
      console.log(`deleteQuiz - Deleting quiz with ID: ${quizId}`);

      if (!tutorId) {
        console.error('deleteQuiz - No tutor ID found');
        res.status(HTTP_STATUS.UNAUTHORIZED).json({ message: ERROR_MESSAGES.UNAUTH_NO_USER_FOUND });
        return;
      }

      await this.quizService.deleteQuiz(tutorId, quizId);
      console.log(`Quiz deleted: ${quizId}`);
      res.status(HTTP_STATUS.OK).json({ message: SUCCESS_MESSAGES.DELETE_SUCCESS });
    } catch (error: any) {
      console.error('Error deleting quiz:', error.message);
      res.status(HTTP_STATUS.INTERNAL_SERVER_ERROR).json({ message: ERROR_MESSAGES.SERVER_ERROR });
    }
  }
}