import { IProgressService } from "../interfaces/serviceInterface/IprogressServices";
import { IProgressRepository } from "../interfaces/repositoryInterface/IprogressRepository";

export class ProgressService implements IProgressService {
  constructor(private _progressRepository: IProgressRepository) {}

  async markLessonCompleted(
    userId: string,
    courseId: string,
    lessonId: string
  ): Promise<void> {
    await this._progressRepository.markLessonCompleted(
      userId,
      courseId,
      lessonId
    );
  }

  async getCompletedLessons(
    userId: string,
    courseId: string
  ): Promise<string[]> {
   return await this._progressRepository.getCompletedLessons(userId,courseId);
  }
}