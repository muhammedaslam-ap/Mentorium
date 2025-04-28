import { ICourseService } from "../interfaces/serviceInterface/IcourseServices";
import { CourseRepository } from "../repositories/courseRepository";
import { TCourseAdd } from "../types/course";
import { TCourseFilterOptions } from "../types/user";
import { createSecureUrl } from "../utils/cloudinaryURL";

export class CourseService implements ICourseService {
  constructor(private _courseRepository: CourseRepository) {}

  async getCourseById(courseId: string, tutorId: string) {
    try {
      if (!courseId || !tutorId) {
        return { success: false, statusCode: 400, message: "Invalid courseId or tutorId" };
      }

      const course = await this._courseRepository.findByIdAndTutor(courseId, tutorId);

      if (!course) {
        return { success: false, statusCode: 404, message: "Course not found or unauthorized" };
      }

      const secureThumbnail = await createSecureUrl(course.thumbnail, 'image');

      return {
        success: true,
        statusCode: 200,
        course: {
          _id: course._id.toString(), // Ensure _id is a string
          title: course.title,
          tagline: course.tagline,
          category: course.category,
          difficulty: course.difficulty,
          price: course.price,
          about: course.about,
          thumbnail: secureThumbnail,
          tutor: course.tutorId.toString(), // Ensure tutorId is a string
        },
      };
    } catch (error) {
      console.error("CourseService Error:", error);
      return { success: false, statusCode: 500, message: "Server error" };
    }
  }

  async addCourse(
    data: TCourseAdd,
    thumbnail: string,
    tutorId: string
  ): Promise<void> {
    await this._courseRepository.addCourse(data, thumbnail, tutorId);
  }

  async getTutorCourses(
    tutorId: string,
    page: number,
    limit: number
  ): Promise<{ courses: TCourseAdd[] | null; totalCourses: number }> {
    console.log('here is the tutor id in service', tutorId)
    const {courses,totalCourses} = await this._courseRepository.getTutorCourses(
      tutorId,
      page,
      limit
    );
    
    return {courses,totalCourses};
  }

  async updateCourse(
    data: TCourseAdd,
    thumbnail: string,
    courseId: string
  ): Promise<void> {
    await this._courseRepository.editCourse(data, thumbnail, courseId);
  }

  async deleteCourse(courseId: string): Promise<void> {
    await this._courseRepository.deleteCourse(courseId);
  }

  async getAllCourses(
    options: TCourseFilterOptions
  ): Promise<{ courses: TCourseAdd[]; total: number }> {
    return this._courseRepository.getAllCourses(options);
  }

}