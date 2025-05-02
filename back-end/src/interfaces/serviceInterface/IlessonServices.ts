import { TLesson, TLessonInput } from '../../types/lesson';
import { MulterS3File } from '../../types/multer';

export interface ILessonService {
  addLesson(tutorId: string, lessonData: TLessonInput, file: MulterS3File): Promise<TLesson>;
  getLessonById(lessonId: string): Promise<TLesson | null>;
  getLessonsByCourseId(courseId: string): Promise<TLesson[]>;
  updateLesson(tutorId: string, lessonId: string, lessonData: Partial<TLessonInput>, file?: MulterS3File): Promise<TLesson>;
  deleteLesson(tutorId: string, lessonId: string): Promise<void>;
}