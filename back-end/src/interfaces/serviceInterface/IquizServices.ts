import { TquizInput,  Tquiz} from '../../types/quiz';

export interface IquizService {
  addQuiz(tutorId: string, quizData: TquizInput): Promise<TquizInput>;                     
  getQuizById(quizId: string): Promise<Tquiz | null>;                                  
  getQuizByLessonId(courseId: string): Promise<Tquiz[]>;                            
  updateQuiz(tutorId: string, quizId: string, quizData: Partial<TquizInput>): Promise<Tquiz>;
  deleteQuiz(tutorId: string, quizId: string): Promise<void>;                          
}