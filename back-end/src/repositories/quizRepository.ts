import { IquizRepository } from '../interfaces/repositoryInterface/IquizRepository';
import { Tquiz, TquizInput } from '../types/quiz';
import { quizModel } from '../models/quizModel';

export class quizRepository implements IquizRepository {
  async createquiz(quizData: TquizInput): Promise<TquizInput> {
     const created = await quizModel.create(quizData);
    return created.toObject(); 
  }

  async getquizById(quizId: string): Promise<Tquiz | null> {
    console.log(`getquizById - Fetching quiz with ID: ${quizId}`);
    const quiz = await quizModel.findById(quizId).lean().exec();
    if (!quiz) {
      console.log(`getquizById - quiz not found: ${quizId}`);
      return null;
    }

    const transformedquiz: Tquiz = {
      _id:quiz._id,
      lesson_id: quiz.lesson_id,
      question: quiz.question,
      options:quiz.options,
      answer:quiz.answer
    };
    console.log(`getquizById - quiz fetched:`, transformedquiz);
    return transformedquiz;
  }

  async getquizsByLessonId(lessonId: string): Promise<Tquiz[]> {
  console.log(`getquizsByLessonId - Fetching quizzes for lessonId: ${lessonId}`);
  
  const quizzes = await quizModel
    .find({ lesson_id: lessonId })
    .sort({ createdAt: 1 })
    .lean()
    .exec();

  const transformedQuizzes: Tquiz[] = quizzes.map((quiz) => ({
    _id: quiz._id,
    lesson_id: quiz.lesson_id,
    question: quiz.question,
    options: quiz.options,
    answer: quiz.answer,
    createdAt: quiz.createdAt,
    updatedAt: quiz.updatedAt,
  }));

  console.log(`getquizsByLessonId - Quizzes fetched:`, transformedQuizzes);
  return transformedQuizzes;
}

  async updatequiz(quizId: string, quizData: Partial<TquizInput>): Promise<void> {
    console.log(`updatequiz - Updating quiz with ID: ${quizId}`, quizData);
    const result = await quizModel.updateOne({ _id: quizId }, { $set: quizData });
    if (result.matchedCount === 0) {
      console.log(`updatequiz - quiz not found: ${quizId}`);
      throw new Error('quiz not found');
    }
    console.log(`updatequiz - quiz updated successfully: ${quizId}`);
  }

  async deletequiz(quizId: string): Promise<void> {
    console.log(`deletequiz - Deleting quiz with ID: ${quizId}`);
    const result = await quizModel.deleteOne({ _id: quizId });
    if (result.deletedCount === 0) {
      console.log(`deletequiz - quiz not found: ${quizId}`);
      throw new Error('quiz not found');
    }
    console.log(`deletequiz - quiz deleted successfully: ${quizId}`);
  }
}