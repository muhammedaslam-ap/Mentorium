import { Request, Response, Router } from "express";
import {
  authorizeRole,
  userAuthMiddleware,
} from "../middlewares/userAuthMiddleware";
import { checkUserBlocked } from "../middlewares/checkUserBlocked";
import { CustomRequest } from "../middlewares/userAuthMiddleware";

import { injectedCourseController } from "../di/courseInjection";
import { upload } from "../utils/multer";

export class CourseRoutes {
  public router: Router;

  constructor() {
    this.router = Router();
    this.initializeRoutes();
  }

  initializeRoutes() {
    this.router.post(
      "/add",
      upload.single("thumbnail"),
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) => {
        console.log("hiiii");
        injectedCourseController.addCourse(req as CustomRequest, res);
      }
    );

    this.router.get(
      "/my-courses",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,
      (req: Request, res: Response) => {
        console.log("hellooo");
        injectedCourseController.getTutorCourses(req as CustomRequest, res);
      }
    );

    this.router.get(
      "/:courseId",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,
      (req: Request, res: Response) => {
        //   console.log("GET /courses/:courseId:", { params: req.params, tutor: req. });
        injectedCourseController.getCourseById(req as CustomRequest, res);
      }
    );

    this.router.put(
      "/update/:courseId",
      upload.single("thumbnail"),
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedCourseController.updateCourse(req as CustomRequest, res)
    );

    this.router.delete(
      "/delete/:courseId",
      userAuthMiddleware,
      authorizeRole(["tutor"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedCourseController.deleteCourse(req as CustomRequest, res)
    );

    this.router.get(
      "/all-courses",
      userAuthMiddleware,
      authorizeRole(["user"]),
      checkUserBlocked,

      (req: Request, res: Response) =>
        injectedCourseController.getAllCourses(req as CustomRequest, res)
    );
  }
}

export default new CourseRoutes().router;
