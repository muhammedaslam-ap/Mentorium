import { TCourseAdd, TCourseResponse } from "../../types/course";
import { TCourseFilterOptions, TStudent, TUserModel } from "../../types/user";


export interface ICourseRepository {
  addCourse(
    data: TCourseAdd,
    thumbnail: string,
    tutorId: string
  ): Promise<void>;
  getTutorCourses(
    tutorId: string,
    page: number,
    limit: number
  ): Promise<{ courses: TCourseAdd[] | null; totalCourses: number }>;
  editCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void>;
  deleteCourse(courseId: string): Promise<void>;
  getAllCourses(
    options: TCourseFilterOptions
  ): Promise<{ courses: TCourseAdd[]; total: number }>;
  findByIdAndTutor(
    courseId: string,
    tutorId: string
  ): Promise<TCourseResponse | null>;
  getCourseDetails(courseId: string): Promise<TCourseAdd | null>;
  getAllStudents(courseId: string): Promise< TUserModel[]| null> 
    

}