import { CourseController } from "../controller/courseController";
import { CourseRepository } from "../repositories/courseRepository";
import { CourseService } from "../services/courseServices";

const courseRepository = new CourseRepository();

const courseService = new CourseService(courseRepository);


export const injectedCourseController = new CourseController(courseService)