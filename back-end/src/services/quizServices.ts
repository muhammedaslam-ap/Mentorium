import {IquizRepository} from '../interfaces/repositoryInterface/IquizRepository' 
import {Tquiz,TquizInput} from '../types/quiz'
import {IquizService} from '../interfaces/serviceInterface/IquizServices'



export class quizService implements IquizService {
  constructor(private quizRepository: IquizRepository) {}

  async addQuiz(tutorId: string, quizData: TquizInput): Promise<TquizInput> {
    if (!tutorId) throw new Error('Tutor ID is required');
    if (!quizData) throw new Error('Quiz data is required');
    
    return await this.quizRepository.createquiz(quizData);
  }

  async deleteQuiz(tutorId: string, quizId: string): Promise<void> {
    if (!tutorId || !quizId) throw new Error('Tutor ID and quiz ID are required');
    await this.quizRepository.deletequiz(quizId);
  }

  async getQuizById(quizId: string): Promise<Tquiz | null> {
    if (!quizId) throw new Error('Quiz ID is required');
    return await this.quizRepository.getquizById(quizId);
  }

  async getQuizByLessonId(courseId: string): Promise<Tquiz[]> {
    if (!courseId) throw new Error('Course ID is required');
    return await this.quizRepository.getquizsByLessonId(courseId);
  }

  async updateQuiz(tutorId: string, quizId: string, quizData: Partial<TquizInput>): Promise<Tquiz> {
    if (!tutorId || !quizId) throw new Error('Tutor ID and quiz ID are required');
    await this.quizRepository.updatequiz(quizId, quizData);
    const updated = await this.quizRepository.getquizById(quizId);
    if (!updated) throw new Error('Quiz not found after update');
    return updated;
  }
}
