import { TLesson, TLessonInput } from '../../types/lesson';

export interface ILessonRepository {
  createLesson(lessonData: TLessonInput): Promise<void>;
  getLessonById(lessonId: string): Promise<TLesson | null>;
  getLessonsByCourseId(courseId: string): Promise<TLesson[]>;
  updateLesson(lessonId: string, lessonData: Partial<TLesson>): Promise<void>;
  deleteLesson(lessonId: string): Promise<void>;
}