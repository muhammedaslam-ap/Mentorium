
import { TCourseAdd } from "../../types/course";
import { TCourseFilterOptions, TStudent, TUserModel } from "../../types/user";

export interface ICourseService {
  getCourseById(courseId: string, tutorId: string): Promise<any>;
  addCourse(data: TCourseAdd, thumbnail: string, tutorId: string): Promise<void>;
  getTutorCourses(tutorId: string, page: number, limit: number): Promise<{ courses: TCourseAdd[] | null; totalCourses: number }>;
  updateCourse(data: TCourseAdd, thumbnail: string, courseId: string): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  getAllCourses(options: TCourseFilterOptions): Promise<{ courses: TCourseAdd[]; total: number }>;
  getCourseDetails(courseId: string): Promise<TCourseAdd | null>;
  getAllStudents(courseId: string): Promise< TUserModel[]| null> 


}
