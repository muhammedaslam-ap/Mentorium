import { Tquiz, TquizInput } from '../../types/quiz';

export interface IquizRepository {
  createquiz(quizData: TquizInput): Promise<TquizInput>;
  getquizById(quizId: string): Promise<Tquiz | null>;
  getquizsByLessonId(courseId: string): Promise<Tquiz[]>;
  updatequiz(quizId: string, quizData: Partial<Tquiz>): Promise<void>;
  deletequiz(quizId: string): Promise<void>;
}