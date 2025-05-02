import { ILessonRepository } from '../interfaces/repositoryInterface/IlessonRepository';
import { TLesson, TLessonInput } from '../types/lesson';
import { lessonModel } from '../models/lessonModel';

export class LessonRepository implements ILessonRepository {
  async createLesson(lessonData: TLessonInput): Promise<void> {
    console.log('createLesson - Creating lesson with file:', lessonData.file);
    await lessonModel.create(lessonData);
    console.log('createLesson - Lesson created successfully');
  }

  async getLessonById(lessonId: string): Promise<TLesson | null> {
    console.log(`getLessonById - Fetching lesson with ID: ${lessonId}`);
    const lesson = await lessonModel.findById(lessonId).lean().exec();
    if (!lesson) {
      console.log(`getLessonById - Lesson not found: ${lessonId}`);
      return null;
    }

    const transformedLesson: TLesson = {
      _id: lesson._id.toString(),
      title: lesson.title,
      courseId: lesson.courseId.toString(),
      description: lesson.description,
      file: lesson.file,
      duration: lesson.duration ?? undefined,
      order: lesson.order ?? undefined,
      createdAt: lesson.createdAt?.toISOString(),
      updatedAt: lesson.updatedAt?.toISOString(),
    };
    console.log(`getLessonById - Lesson fetched:`, transformedLesson);
    return transformedLesson;
  }

  async getLessonsByCourseId(courseId: string): Promise<TLesson[]> {
    console.log(`getLessonsByCourseId - Fetching lessons for courseId: ${courseId}`);
    const lessons = await lessonModel.find({ courseId }).sort({ order: 1 }).lean().exec();

    const transformedLessons: TLesson[] = lessons.map((lesson) => ({
      _id: lesson._id.toString(),
      title: lesson.title,
      courseId: lesson.courseId.toString(),
      description: lesson.description,
      file: lesson.file,
      duration: lesson.duration ?? undefined,
      order: lesson.order ?? undefined,
      createdAt: lesson.createdAt?.toISOString(),
      updatedAt: lesson.updatedAt?.toISOString(),
    }));
    console.log(`getLessonsByCourseId - Lessons fetched:`, transformedLessons);
    return transformedLessons;
  }

  async updateLesson(lessonId: string, lessonData: Partial<TLessonInput>): Promise<void> {
    console.log(`updateLesson - Updating lesson with ID: ${lessonId}`, lessonData);
    const result = await lessonModel.updateOne({ _id: lessonId }, { $set: lessonData });
    if (result.matchedCount === 0) {
      console.log(`updateLesson - Lesson not found: ${lessonId}`);
      throw new Error('Lesson not found');
    }
    console.log(`updateLesson - Lesson updated successfully: ${lessonId}`);
  }

  async deleteLesson(lessonId: string): Promise<void> {
    console.log(`deleteLesson - Deleting lesson with ID: ${lessonId}`);
    const result = await lessonModel.deleteOne({ _id: lessonId });
    if (result.deletedCount === 0) {
      console.log(`deleteLesson - Lesson not found: ${lessonId}`);
      throw new Error('Lesson not found');
    }
    console.log(`deleteLesson - Lesson deleted successfully: ${lessonId}`);
  }
}