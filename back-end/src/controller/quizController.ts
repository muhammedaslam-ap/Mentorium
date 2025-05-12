import { Response } from 'express';
import { CustomRequest } from '../middlewares/userAuthMiddleware';
import { Tquiz,TquizInput } from '../types/quiz';
import { IquizService } from '../interfaces/serviceInterface/IquizServices';

export class QuizController {
  constructor(private quizService: IquizService) {}

  async addQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const { question,answer,lesson_id,options } = req.body;
      console.log('addLesson - Request body:', {question,answer,lesson_id,options});

      if (!tutorId) {
        console.error('addquiz - No tutor ID found');
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
        return;
      }

        if (!lesson_id) {
        console.error('addLesson - Missing required fields lesson_id');
        res.status(400).json({ message: 'Title, lesson_id' });
        return;
      }
     
      if (!question || !answer || !options) {
        console.error('addLesson - Missing required fields');
        res.status(400).json({ message: 'question, answer, and options are required' });
        return;
      }

      const lessonData: TquizInput = {
        answer,
        lesson_id,
        options,
        question
      };

      const quiz = await this.quizService.addQuiz(tutorId, lessonData);
      console.log(`quiz added for lesson: ${lesson_id}`);
      res.status(201).json({ message: 'Lesson added successfully',quiz});
    } catch (error: any) {
      console.error('Error adding quiz:', error.message);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  async getQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const quizId = req.params.quizId;
      console.log(`getLesson - Fetching quiz with ID: ${quizId}`);
      const quiz = await this.quizService.getQuizById(quizId);

      if (!quiz) {
        console.log(`quiz not found: ${quizId}`);
        res.status(404).json({ message: 'quiz not found' });
        return;
      }

      console.log(`Lesson fetched:`, quiz);
      res.status(200).json({ quiz });
    } catch (error: any) {
      console.error('Error fetching quiz:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async getQuizByLesson(req: CustomRequest, res: Response): Promise<void> {
    try {
      const lessonId = req.params.lessonId;
      console.log(`getQuizByLesson - Fetching quiz for lessonId: ${lessonId}`);
      const quiz = await this.quizService.getQuizByLessonId(lessonId);

      console.log(`quiz fetched for lessonId: ${lessonId}`, quiz);
      res.status(200).json({ quiz });
    } catch (error: any) {
      console.error('Error fetching quiz:', error.message);
      res.status(500).json({ message: 'Internal server error' });
    }
  }

  async updateQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const quiId = req.params.quizId;
      const {  answer,
       lesson_id,
       options,
       question } = req.body;
      console.log('updateQuiz - Request body:', {  answer,
       lesson_id,
       options,
       question });

      if (!quiId) {
        console.error('updateLesson - No quiz ID found',quiId);
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
        return;
      }
      const lessonData: Partial<TquizInput> = {
       answer,
       lesson_id,
       options,
       question
      };

      const lesson = await this.quizService.updateQuiz(tutorId, quiId, lessonData);
      console.log(`quiz updated: ${quiId}`);
      res.status(200).json({ message: 'quiz updated successfully', lesson });
    } catch (error: any) {
      console.error('Error updating quiz:', error.message);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }

  async deleteQuiz(req: CustomRequest, res: Response): Promise<void> {
    try {
      const tutorId = req.user?.id;
      const quizId = req.params.quizId;
      console.log(`deleteQuiz- Deleting quiz with ID: ${quizId}`);

      if (!tutorId) {
        console.error('deleteQuiz - No tutor ID found');
        res.status(401).json({ message: 'Unauthorized: No tutor ID found' });
        return;
      }

      await this.quizService.deleteQuiz(tutorId, quizId);
      console.log(`quiz deleted: ${quizId}`);
      res.status(200).json({ message: 'quiz deleted successfully' });
    } catch (error: any) {
      console.error('Error deleting quiz:', error.message);
      res.status(500).json({ message: error.message || 'Internal server error' });
    }
  }
}