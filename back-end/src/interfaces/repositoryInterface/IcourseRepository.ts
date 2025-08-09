import { TCourseAdd } from "../../types/course";
import { TCourseFilterOptions, TUserModel } from "../../types/user";

export interface ICourseRepository {
  findByIdAndTutor(courseId: string, tutorId: string): Promise<any>;
  addCourse(data: TCourseAdd, thumbnail: string, tutorId: string): Promise<void>;
  getCourseDetails(courseId: string): Promise<TCourseAdd | null>;
  getAllStudents(courseId: string): Promise<TUserModel[]>;
 getTutorCourses(
  tutorId: string,
  page: number,
  limit: number
): Promise<{ courses: TCourseAdd[]; totalCourses: number }>   

  editCourse(data: TCourseAdd, thumbnail: string, courseId: string): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  getAllCourses(options: TCourseFilterOptions): Promise<{ courses: TCourseAdd[]; total: number }>;
}
